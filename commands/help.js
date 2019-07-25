const Discord = require('discord.js')

module.exports.run = async (client, message, args) => {
  var formattedData = []
  client.commands.forEach(cmd => {
    formattedData.push(`?${cmd.help.name} - \`${cmd.help.help.desc}\``)
  })
  if (args[0]) {
    let command = client.commands.get(args[0]) || client.aliases.get(args[0])
    if (!command) return message.channel.send("I couldn't find that command.")
    let cmdEmbed = new Discord.RichEmbed()
      .setAuthor(command.help.name)
      .addField('Usage', command.help.help.usage, true)
      .addField('Description', command.help.help.desc, true)
      .setColor('#ff30a9')
      .setTimestamp()
      .setFooter(`Run ?help to see a list of all commands.`)
    return message.channel.send(cmdEmbed)
  }
  let helpEmbed = new Discord.RichEmbed()
    .setDescription(formattedData.join('\n'))
    .setAuthor('Fehlerbot Help Menu™')
    .setColor('#ff30a9')
    .setThumbnail(client.user.avatarURL)
    .setTimestamp()
    .setFooter(`Run ?help [command] to see more details about a command.`)
  message.channel.send(helpEmbed)
}

module.exports.help = {
  name: 'help',
  help: {
    desc: 'Displays the help menu.',
    usage: '?help'
  }
}
