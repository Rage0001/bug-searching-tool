const trello = require('../modules/trello.js')
const Discord = require('discord.js')
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

  let trelloURL = args[0]
  let trelloCardId = trello.urlRegex(trelloURL)
  if (!trelloCardId || !trelloCardId[1]) {
    return message.channel.send('Not a Trello URL.')
  }

  var ticketEmbed = new Discord.RichEmbed()

  const renderCard = async card => {
    if (!card || card.length === 0) {
      return message.channel.send('No results returned.')
    }

    let listName = card.list.name
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
        videos.push(`Video ${videos.length + 1}: ${attachment.url}`)
      } else {
        if (firstImage) {
          firstImage = !firstImage
          ticketEmbed.setImage(attachment.url)
        } else {
          pictures.push(`[Image ${pictures.length + 1}](${attachment.url})`)
        }
      }
    })

    if (card.name.length > 250) {
      ticketEmbed.setTitle(card.name.substring(0, 247) + '...')
    } else {
      ticketEmbed.setTitle(card.name)
    }
    ticketEmbed.setDescription(
      `Board: [${card.board.name}](${card.board.url})\n` +
		`List: ${card.list.name}\n` +
        `Labels: ${finalLabels}\n` +
        `Archived: ${card.closed === true ? 'Yes' : 'No'}` +
        `\n\n` +
        `${formattedDesc}\n\nLink: ${card.shortUrl}` +
        (videos.length > 0 ? `\n${videos.join('\n')}` : '') +
        (pictures.length > 0 ? `\nOther images: ${pictures.join(', ')}` : '')
    )
    ticketEmbed.setColor('#1b9100')
    ticketEmbed.setFooter(
      `Executed by ${message.author.tag}`,
      message.author.avatarURL
    )
    message.channel.send("Here you go, here's what I found:", {
      embed: ticketEmbed
    })
  }

  renderCard(await trello.getTicket(trelloCardId[1]))
}

module.exports.help = {
  name: 'ticket',
  help: {
    desc: 'Shows information about a given ticket.',
    usage: 'ticket [ticket]'
  },
  aliases: ['t']
}
