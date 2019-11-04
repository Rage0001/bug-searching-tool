const Discord = require('discord.js')

module.exports.run = async (client, message, args) => {
  if (!message.guild.me.hasPermission('EMBED_LINKS')) {
    return message.channel.send(
      'ERROR: I require the `EMBED_LINKS` Permission to run this command.'
    )
  }

  var prefix = client.config.get('prefix')
  if (args[0]) {
    let command =
      client.commands.get(args[0]) ||
      client.commands.get(client.aliases.get(args[0]))
    if (!command) return message.channel.send("I couldn't find that command.")
    let cmdEmbed = new Discord.RichEmbed()
      .setAuthor(command.help.name)
      .addField('Usage', prefix + command.help.help.usage, true)
      .addField('Description', command.help.help.desc, true)
      .setColor('#ff30a9')
      .setTimestamp()
      .setFooter(`Run ${prefix}help to see a list of all commands.`)
    return message.channel.send(cmdEmbed)
  }

  var formattedData = []
  client.commands.forEach(cmd => {
    formattedData.push(`${prefix}${cmd.help.name} - \`${cmd.help.help.desc}\``)
  })
  let helpEmbed = new Discord.RichEmbed()
    .setDescription(formattedData.join('\n'))
    .setAuthor('Fehlerbot Help Menu™')
    .setColor('#ff30a9')
    .setThumbnail(client.user.avatarURL)
    .setTimestamp()
    .setFooter(
      `Run ${prefix}help [command] to see more details about a command.`
    )
  message.channel.send(helpEmbed)
}

module.exports.help = {
  name: 'help',
  help: {
    desc: 'Displays the help menu.',
    usage: 'help'
  },
  aliases: ['h']
}
