module.exports.run = async (client, message, args) => {
  message.channel.send(
    `People have searched trello cards \`${client.queries}\` times through me during this session.`
  )
}

module.exports.help = {
  name: 'stats'
}
