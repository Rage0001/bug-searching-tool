const Discord = require('discord.js')
const trello = require('../modules/trello.js')

module.exports.run = async (client, message, args) => {
  if (!args[0])
    return message.channel.send(`Please provide a user prefix to search for.`)
  const results = await trello.getUsers({
    prefix: args[0]
  })
  const userResult = results.hits.map(result => `\`${result.user}\``)
  const embed = new Discord.RichEmbed({
    title: 'User Prefix Search',
    description: userResult.join('\n'),
    color: 0x673ab7,
    footer: {
      text: `Executed by ${message.author.tag}`,
      icon_url: message.author.avatarURL
    }
  })
  message.channel.send(embed)
}

module.exports.help = {
  name: 'users',
  help: {
    desc: 'Searches users in DiscordTag#0000 form based on prefix.',
    usage: 'users [user]'
  },
  aliases: ['user', 'u']
}
