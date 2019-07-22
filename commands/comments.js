const trello = require('../modules/trello.js')
const Discord = require('discord.js')
module.exports.run = async (client, message, args) => {
  let trelloURL = args[0]
  let trelloCardId = trelloURL.match(
    /(?:(?:<)?(?:https?:\/\/)?(?:www\.)?trello.com\/c\/)?([^\/|\s|\>]+)(?:\/|\>)?(?:[\w-\d]*)?(?:\/|\>|\/>)?\s*\|?\s*([\s\S]*)/i
  )
  if (!trelloCardId || !trelloCardId[1]) {
    return message.channel.send('Not a Trello URL.')
  }

  var commentsEmbed = new Discord.RichEmbed()

  const card = await trello.getTicket(trelloCardId[1])
  if (!card || card.length === 0) {
    return message.channel.send('No results returned.')
  }
  var comments = await trello.getComments(trelloCardId[1])
  if (!comments) {
    return message.channel.send("That ticket isn't on one of the bug boards.")
  }
  var crandcnr = await trello.getReproRatio(comments)
  var filteredComments = await trello.filterComments(comments)

  let usercomments = filteredComments.userComments.join(
    '\n-----------------------\n'
  )
  let admincomments = filteredComments.adminComments.join(
    '\n-----------------------\n'
  )
  if (card.name.length > 250) {
    commentsEmbed.setTitle(card.name.substring(0, 247) + '...')
  } else {
    commentsEmbed.setTitle(card.name)
  }
  commentsEmbed.addField('CR / CNR Ratio', `${crandcnr.crs} / ${crandcnr.cnrs}`)
  if (usercomments.length > 1024) {
    usercomments = usercomments.substring(0, 1021) + '...'
  }
  if (admincomments.length > 1024) {
    admincomments = admincomments.substring(0, 1021) + '...'
  }
  commentsEmbed.addField('User Comments', usercomments)
  if (admincomments !== '') {
    commentsEmbed.addField('Admin Comments', admincomments)
  }
  commentsEmbed.setFooter(
    `Executed by ${message.author.tag}`,
    message.author.avatarURL
  )
  commentsEmbed.setTimestamp()
  commentsEmbed.setURL(card.shortUrl)
  commentsEmbed.setColor('BLUE')
  message.channel.send(commentsEmbed)
}

module.exports.help = {
  name: 'comments'
}
