const config = require('../config.json')
const trello = require('../modules/trello.js')
const request = require('request')
const Discord = require('discord.js')
const boards = ['desktop', 'ios', 'linux', 'android', 'store', 'web', 'overlay']

module.exports.run = async (client, message, args) => {
  const labelSeverity = ['red', 'orange', 'yellow', 'green']
  const emotesSeverity = [
    client.parseEmoji('p0'),
    client.parseEmoji('p1'),
    client.parseEmoji('p2'),
    client.parseEmoji('p3')
  ]
  const labelPriority = ['sky', 'lime', 'pink']
  const emotesPriority = [
    client.parseEmoji('low'),
    client.parseEmoji('mid'),
    client.parseEmoji('high')
  ]
  let board = args[0]
  let input = args.slice(1).join(' ')
  if (!boards.includes(board.toLowerCase())) {
    return message.channel.send('Not a valid board.')
  }
  if (!input) {
    return message.channel.send('Please provide a query.')
  }
  var boardID = config.trello[board.toLowerCase() + '_bugs']

  var resultsEmbed = new Discord.RichEmbed()

  let currentPage = 0

  let botMsg = null

  const renderSearch = async cards => {
    if (cards.length > 1 || currentPage !== 0) {
      var cardsDone = []
      cards.forEach(card => {
        cardsDone.push(`**${card.name}**\nLink: ${card.shortUrl}`)
      })
      let forwardEmoji = '▶'
      let backwardEmoji = '◀'
      resultsEmbed.setTitle(`Results (page ${currentPage + 1}):`)
      resultsEmbed.setDescription(cardsDone.join('\n\n'))
      resultsEmbed.setColor('#ff3535')
      resultsEmbed.setFooter(
        `Executed by ${message.author.tag}`,
        message.author.avatarURL
      )
      if (botMsg == null) {
        botMsg = await message.channel.send(resultsEmbed)
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
              currentPage++
              const searchResults = await trello.trelloSearch(
                input,
                boardID,
                currentPage
              )
              if (searchResults.length === 0) {
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
        client.queries++
      } else {
        botMsg.edit(resultsEmbed)
      }
    } else {
      if (cards.length === 0) {
        return message.channel.send('No results returned.')
      }

      let listName = await trello.getListName(cards[0].id)
      let formattedDesc = await trello.formatDescription(cards[0].desc)
      var labels = []
      if (cards[0].labels.length !== 0) {
        if (cards[0].labels.length === 1) {
          labels.push(
            emotesSeverity[labelSeverity.indexOf(cards[0].labels[0].color)]
          )
        } else {
          cards[0].labels.forEach(label => {
            if (labelSeverity.includes(label.color)) {
              labels.push(emotesSeverity[labelSeverity.indexOf(label.color)])
            }
            if (labelPriority.includes(label.color)) {
              labels.push(emotesPriority[labelPriority.indexOf(label.color)])
            }
          })
        }
      }
      let finalLabels = labels.join(' ')
      if (finalLabels === '') finalLabels = 'None'
      message.channel.send("Here you go, here's what I found:")
      if (cards[0].attachments.length !== 0) {
        var youtubeURL = cards[0].attachments[0].url.match(
          '^(https?://)?(www.)?(youtube.com|youtu.?be)/.+$'
        )
        if (!youtubeURL) {
          resultsEmbed.setImage(cards[0].attachments[0].url)
        }
      }
      if (cards[0].name.length > 250) {
        resultsEmbed.setTitle(cards[0].name.substring(0, 247) + '...')
      } else {
        resultsEmbed.setTitle(cards[0].name)
      }
      if (youtubeURL) {
        resultsEmbed.setDescription(
          `Labels: ${finalLabels}\nList: ${listName}\nArchived: ${
            cards[0].closed === true ? 'Yes' : 'No'
          }\n\n${formattedDesc}\n\nLink: ${cards[0].shortUrl}\nVideo: ${
            cards[0].attachments[0].url
          }`
        )
      } else {
        resultsEmbed.setDescription(
          `Labels: ${finalLabels}\nList: ${listName}\nArchived: ${
            cards[0].closed === true ? 'Yes' : 'No'
          }\n\n${formattedDesc}\n\nLink: ${cards[0].shortUrl}`
        )
      }
      resultsEmbed.setColor('#ff3535')
      resultsEmbed.setFooter(
        `Executed by ${message.author.tag}`,
        message.author.avatarURL
      )
      message.channel.send(resultsEmbed)
      client.queries++
    }
  }
  renderSearch(await trello.trelloSearch(input, boardID, 0))
}

module.exports.help = {
  name: 'search'
}
