const Discord = require('discord.js')
const trello = require('../modules/trello.js')

module.exports.run = async (client, message) => {
  const users = message.content
    .slice(client.config.get('prefix').length + 'stats'.length)
    .split(',')
    .map(u => u.trim())
  if (!users[0])
    return message.channel.send(
      `Please provide at least one user to show statistics for.`
    )

  var embed = new Discord.RichEmbed()
    .setTitle('Please choose one of the categories to view:')
    .setColor('#fff024')
    .setDescription('1. CR statistics per board\n2. CNR statistics per board')
  var msg = await message.channel.send(embed)
  let oneEmoji = client.emojiChars[1]
  let twoEmoji = client.emojiChars[2]
  let oneReaction = await msg.react(oneEmoji)
  let twoReaction = await msg.react(twoEmoji)
  const filter = (reaction, user) => user.id === message.author.id
  const collector = msg.createReactionCollector(filter)

  collector.on('collect', async r => {
    let reproType
    if (r.emoji.name === oneEmoji) {
      reproType = 'cr'
    } else if (r.emoji.name === twoEmoji) {
      reproType = 'cnr'
    } else {
      return
    }

    var oneUserReaction = r.message.reactions.filter(
      r => r._emoji.name === oneEmoji
    )
    oneUserReaction.first().remove(message.author)
    collector.stop()

    const userBoardTotalMap = new Map()

    const totalProm = trello.getTotalRepros(reproType)
    const boardTotalProm = trello.getBoardRepros(reproType)
    const userTotalProm = Promise.all(
      users.map(async user => {
        return (await trello.getUserRepros(user, reproType)).total
      })
    )
    const userBoardProm = Promise.all(
      users.map(async user => {
        const result = await trello.getUserBoardRepros(user, reproType)
        result.forEach(({ total, board }) => {
          if (!userBoardTotalMap.get(board)) {
            userBoardTotalMap.set(board, total)
          } else {
            userBoardTotalMap.set(board, userBoardTotalMap.get(board) + total)
          }
        })
      })
    )

    const [total, boardTotal, userTotals] = await Promise.all([
      totalProm,
      boardTotalProm,
      userTotalProm,
      userBoardProm
    ])

    const userTotal = { total: userTotals.reduce((a, b) => a + b) }

    const userBoardTotal = []
    userBoardTotalMap.forEach((total, board) => {
      userBoardTotal.push({
        total,
        board
      })
    })
    let percentage = (userTotal.total / total.total) * 100

    let description = `**Total**\n\`${userTotal.total}/${
      total.total
    }\` ${reproType.toUpperCase()}s across all boards which is roughly ${percentage
      .toString()
      .slice(0, 4)}%\n\n`

    let mapped = userBoardTotal.map(
      obj =>
        `**${obj.board}**\n\`${
          userBoardTotal.filter(b => b.board === obj.board)[0].total
        }/${
          boardTotal.filter(b => b.board === obj.board)[0].total
        }\` ${reproType.toUpperCase()}s which is roughly ${(
          (userBoardTotal.filter(b => b.board === obj.board)[0].total /
            boardTotal.filter(b => b.board === obj.board)[0].total) *
          100
        )
          .toString()
          .slice(0, 4)}%`
    )

    description = description += mapped.join('\n\n')

    embed.setTitle(
      `Showing ${
        reproType === 'cr' ? 'canrepro' : 'cannotrepro'
      } statistics for user ${users.join(', ')}:`
    )
    embed.setDescription(description)
    embed.setFooter(
      `Executed by ${message.author.tag}`,
      message.author.avatarURL
    )
    msg.edit(embed)
  })

  collector.on('end', collected => {
    oneReaction.remove(client.user)
    twoReaction.remove(client.user)
  })
}

module.exports.help = {
  name: 'stats',
  help: {
    desc:
      "Shows a user's statistics of their CRs and CNRs. Users must be specified in DiscordTag#0000 format.",
    usage: 'stats [user1],[user2],[userN]'
  }
}
