const Discord = require('discord.js')
const trello = require('../modules/trello.js')

module.exports.run = async (client, message, args) => {
  if (!args[0])
    return message.channel.send(`Please provide a user to show statistics for.`)
  var user = await client.fetchUser(args[0])
  if (!user) return message.channel.send(`Invalid user.`)

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
    switch (r.emoji.name) {
      case oneEmoji:
        embed.setDescription('')
        embed.setTitle('Please wait, this can take a little.')
        msg.edit(embed)

        var oneUserReaction = r.message.reactions.filter(
          r => r._emoji.name === oneEmoji
        )
        oneUserReaction.first().remove(message.author)
        collector.stop()

        let total = await trello.getTotalRepros('cr')
        let boardTotal = await trello.getBoardRepros('cr')
        let userTotal = await trello.getUserRepros(user.tag, 'cr')
        let userBoardTotal = await trello.getUserBoardRepros(user.tag, 'cr')
        let percentage = (userTotal.total / total.total) * 100

        let description = `**Total Canrepros**\n\`${userTotal.total}/${
          total.total
        }\` Canrepros across all boards are yours which is roughly ${percentage
          .toString()
          .slice(0, 4)}%\n\n`

        let mapped = userBoardTotal.map(
          obj =>
            `**${obj.board}**\n\`${
              userBoardTotal.filter(b => b.board === obj.board)[0].total
            }/${
              boardTotal.filter(b => b.board === obj.board)[0].total
            }\` Canrepros are yours which is roughly ${(
              (userBoardTotal.filter(b => b.board === obj.board)[0].total /
                boardTotal.filter(b => b.board === obj.board)[0].total) *
              100
            )
              .toString()
              .slice(0, 4)}%`
        )

        description = description += mapped.join('\n\n')

        embed.setTitle(`Showing CR statistics for user \`${user.tag}\`:`)
        embed.setThumbnail(user.avatarURL)
        embed.setDescription(description)
        msg.edit(embed)
        break
      case twoEmoji:
        embed.setDescription('')
        embed.setTitle('Please wait, this can take a little.')
        msg.edit(embed)

        var twoUserReaction = r.message.reactions.filter(
          r => r._emoji.name === twoEmoji
        )
        twoUserReaction.first().remove(message.author)
        collector.stop()

        let totalTwo = await trello.getTotalRepros('cnr')
        let boardTotalTwo = await trello.getBoardRepros('cnr')
        let userTotalTwo = await trello.getUserRepros(user.tag, 'cnr')
        let userBoardTotalTwo = await trello.getUserBoardRepros(user.tag, 'cnr')
        let percentageTwo = (userTotalTwo.total / totalTwo.total) * 100

        let descriptionTwo = `**Total Cannotrepros**\n\`${userTotalTwo.total}/${
          totalTwo.total
        }\` Cannotrepros across all boards are yours which is roughly ${percentageTwo
          .toString()
          .slice(0, 4)}%\n\n`

        let mappedTwo = userBoardTotalTwo.map(
          obj =>
            `**${obj.board}**\n\`${
              userBoardTotalTwo.filter(b => b.board === obj.board)[0].total
            }/${
              boardTotalTwo.filter(b => b.board === obj.board)[0].total
            }\` Cannotrepros are yours which is roughly ${(
              (userBoardTotalTwo.filter(b => b.board === obj.board)[0].total /
                boardTotalTwo.filter(b => b.board === obj.board)[0].total) *
              100
            )
              .toString()
              .slice(0, 4)}%`
        )

        descriptionTwo = descriptionTwo += mappedTwo.join('\n\n')

        embed.setTitle(`Showing CNR statistics for user \`${user.tag}\`:`)
        embed.setThumbnail(user.avatarURL)
        embed.setDescription(descriptionTwo)
        msg.edit(embed)
        break
      default:
        break
    }
  })

  collector.on('end', collected => {
    oneReaction.remove(client.user)
    twoReaction.remove(client.user)
  })
}

module.exports.help = {
  name: 'stats',
  help: {
    desc: "Shows a user's statistics of their actions on boards.",
    usage: 'stats [userID]'
  }
}
