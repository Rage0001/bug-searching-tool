const config = require('../config.json')
const trello = require('../modules/trello.js')
const Discord = require('discord.js')
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

  let trelloURL = args[0]
  let trelloCardId = trelloURL.match(
    /(?:(?:<)?(?:https?:\/\/)?(?:www\.)?trello.com\/c\/)?([^\/|\s|\>]+)(?:\/|\>)?(?:[\w-\d]*)?(?:\/|\>|\/>)?\s*\|?\s*([\s\S]*)/i
  )
  if (!trelloCardId || !trelloCardId[1]) {
    return message.channel.send('Not a Trello URL.')
  }

  var resultsEmbed = new Discord.RichEmbed()

  const renderCard = async card => {
    if (!card || card.length === 0) {
      return message.channel.send('No results returned.')
    }

    // let listName = await trello.getListName(card.id)
    let listName = card.list.name
    let formattedDesc = await trello.formatDescription(card.desc)
    var labels = []
    if (card.labels.length !== 0) {
      if (card.labels.length === 1) {
        labels.push(emotesSeverity[labelSeverity.indexOf(card.labels[0].color)])
      } else {
        card.labels.forEach(label => {
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
    if (card.attachments.length !== 0) {
      var youtubeURL = card.attachments[0].url.match(
        '^(https?://)?(www.)?(youtube.com|youtu.?be)/.+$'
      )
      if (!youtubeURL) {
        resultsEmbed.setImage(card.attachments[0].url)
      }
    }
    if (card.name.length > 250) {
      resultsEmbed.setTitle(card.name.substring(0, 247) + '...')
    } else {
      resultsEmbed.setTitle(card.name)
    }
    if (youtubeURL) {
      resultsEmbed.setDescription(
        `Board: ${card.board.name}\n` +
          `Labels: ${finalLabels}\n` +
          `List: ${listName}\nArchived: ${
            card.closed === true ? 'Yes' : 'No'
          }` +
          `\n\n` +
          `${formattedDesc}\n\nLink: ${card.shortUrl}\nVideo: ${card.attachments[0].url}`
      )
    } else {
      resultsEmbed.setDescription(
        `Board: ${card.board.name}\n` +
          `Labels: ${finalLabels}\n` +
          `List: ${listName}\nArchived: ${
            card.closed === true ? 'Yes' : 'No'
          }` +
          `\n\n` +
          `${formattedDesc}\n\nLink: ${card.shortUrl}`
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

  renderCard(await trello.getTicket(trelloCardId[1]))
}

module.exports.help = {
  name: 'ticket'
}
