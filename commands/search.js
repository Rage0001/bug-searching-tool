const config = require('../config.json')
const trello = require('../modules/trello.js')
const Discord = require('discord.js')
const boards = ['desktop', 'ios', 'linux', 'android', 'store', 'web', 'overlay']

module.exports.run = async (client, message, args) => {
  if (!message.guild.me.hasPermission('EMBED_LINKS')) {
    return message.channel.send(
      'ERROR: I require the `EMBED_LINKS` Permission to run this command.'
    )
  }

  const labelSeverity = ['red', 'orange', 'yellow', 'green']
  const emojiSeverity = [
    client.parseEmoji('p0'),
    client.parseEmoji('p1'),
    client.parseEmoji('p2'),
    client.parseEmoji('p3')
  ]
  const labelPriority = ['sky', 'lime', 'pink']
  const emojiPriority = [
    client.parseEmoji('low'),
    client.parseEmoji('mid'),
    client.parseEmoji('high')
  ]
  let board = args[0]
  let input = args.slice(1).join(' ')
  if (!boards.includes(board.toLowerCase())) {
    return message.channel.send(
      `Not a valid board, choose from one of these:\n` +
        `\`\`\`${boards.join(' ')}\`\`\``
    )
  }
  if (!input) {
    return message.channel.send('Please provide a query.')
  }
  var boardID = config.trello[board.toLowerCase() + '_bugs']

  var searchEmbed = new Discord.RichEmbed()

  let currentPage = 0

  let botMsg = null

  const renderSearch = async cards => {
    if (cards.total.value === 0) {
      return message.channel.send('No results returned.')
    }
    if (cards.hits.length > 1 || currentPage !== 0) {
      var cardsDone = []
      cards.hits.forEach(card => {
        cardsDone.push(`**${card.event.title}**\nLink: https://trello.com/c/${card.event.link}`)
      })
      let forwardEmoji = '▶'
      let backwardEmoji = '◀'
      searchEmbed.setTitle(`Results (page ${currentPage + 1} of${cards.total.relation === 'gte' ? ' over ' : ' '}${Math.ceil(cards.total.value / 5)}):`)
      searchEmbed.setDescription(cardsDone.join('\n\n'))
      searchEmbed.setColor('#ff3535')
      searchEmbed.setFooter(
        `Executed by ${message.author.tag}`,
        message.author.avatarURL
      )
      if (botMsg == null) {
        botMsg = await message.channel.send(searchEmbed)
        var backwardReaction = await botMsg.react(backwardEmoji)
        var forwardReaction = await botMsg.react(forwardEmoji)
        const filter = (reaction, user) => user.id === message.author.id
        const collector = botMsg.createReactionCollector(filter)
        let stopTimer
        const setStopTimer = () => {
          if (stopTimer !== undefined) {
            clearTimeout(stopTimer)
          }
          stopTimer = setTimeout(() => collector.stop(), 60000)
        }
        setStopTimer()
        collector.on('collect', async r => {
          switch (r.emoji.name) {
            case forwardEmoji:
              setStopTimer()
              var ForwardUserReaction = r.message.reactions.filter(
                r => r._emoji.name === forwardEmoji
              )
              ForwardUserReaction.first().remove(message.author)
              if (cards.total.relation === 'eq' && currentPage + 1 >= Math.ceil(cards.total.value / 5)) {
                return
              }
              currentPage++
              const searchResults = await trello.trelloSearch(
                input,
                boardID,
                currentPage
              )
              if (searchResults.hits.length === 0) {
                currentPage--
                return
              }
              renderSearch(searchResults)
              break
            case backwardEmoji:
              setStopTimer()
              var BackwardUserReaction = r.message.reactions.filter(
                r => r._emoji.name === backwardEmoji
              )
              BackwardUserReaction.first().remove(message.author)
              if (currentPage === 0) {
                return
              }
              currentPage--
              renderSearch(
                await trello.trelloSearch(input, boardID, currentPage)
              )
              break
            default:
              break
          }
        })
        collector.on('end', c => {
          backwardReaction.remove(client.user)
          forwardReaction.remove(client.user)
        })
      } else {
        botMsg.edit(searchEmbed)
      }
    } else {
      const card = await trello.getTicket(cards.hits[0].event.card)
      let listName = await trello.getListName(card.id)
      let formattedDesc = await trello.formatDescription(card.desc)
      var labels = []
      card.labels.forEach(label => {
        if (labelSeverity.includes(label.color)) {
          labels.push(emojiSeverity[labelSeverity.indexOf(label.color)])
        }
        if (labelPriority.includes(label.color)) {
          labels.push(emojiPriority[labelPriority.indexOf(label.color)])
        }
      })
      let finalLabels = labels.join(' ')
      if (finalLabels === '') finalLabels = 'None'

      var videos = []
      var pictures = []
      var firstImage = true
      card.attachments.forEach(attachment => {
        var youtubeURL = attachment.url.match(
          '^(https?://)?(www.)?(youtube.com|youtu.?be)/.+$'
        )
        if (youtubeURL) {
          videos.push(`Video ${videos.length + 1}: ${youtubeURL}`)
        } else {
          if (firstImage) {
            firstImage = !firstImage
            searchEmbed.setImage(attachment.url)
          } else {
            pictures.push(`[Image ${pictures.length + 1}](${attachment.url})`)
          }
        }
      })

      if (card.name.length > 250) {
        searchEmbed.setTitle(card.name.substring(0, 247) + '...')
      } else {
        searchEmbed.setTitle(card.name)
      }
      searchEmbed.setDescription(
        `List: ${listName}\n` +
          `Labels: ${finalLabels}\n` +
          `Archived: ${card.closed === true ? 'Yes' : 'No'}` +
          `\n\n` +
          `${formattedDesc}\n\nLink: ${card.shortUrl}` +
          (videos.length > 0 ? `\n${videos.join('\n')}` : '') +
          (pictures.length > 0 ? `\nOther images: ${pictures.join(', ')}` : '')
      )
      searchEmbed.setColor('#1b9100')
      searchEmbed.setFooter(
        `Executed by ${message.author.tag}`,
        message.author.avatarURL
      )
      message.channel.send("Here you go, here's what I found:", {
        embed: searchEmbed
      })
    }
  }
  renderSearch(await trello.trelloSearch(input, boardID, 0))
}

module.exports.help = {
  name: 'search',
  help: {
    desc: 'Searches for a ticket on any of the trello boards.',
    usage: 'search [board] [query]'
  },
  aliases: ['s']
}
