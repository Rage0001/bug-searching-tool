module.exports = async (client, msg) => {
  if (msg.author.bot) return

  const prefix = client.config.get('prefix')
  if (!msg.content.startsWith(prefix)) return

  const args = msg.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g)
  const command = args.shift().toLowerCase()

  const cmd =
    client.commands.get(command) ||
    client.commands.get(client.aliases.get(command))
  if (cmd) cmd.run(client, msg, args)
}
