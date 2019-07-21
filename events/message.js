module.exports = async (client, msg) => {
  if (msg.author.bot) return

  var prefix = client.config.get('prefix')
  if (!msg.content.startsWith(prefix)) return

  const args = msg.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g)
  const command = args.shift().toLowerCase()

  let commandfile = client.commands.get(command)
  if (commandfile) commandfile.run(client, msg, args)
}
