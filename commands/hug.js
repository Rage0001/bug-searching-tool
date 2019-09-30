const hugMessages = require(`../modules/jsons/hug_messages.json`)

module.exports.run = async (client, message, args) => {
  try {
    if (!args[0]) return message.channel.send('You need to specify a user!')

    let sender = message.author
    let target =
      message.mentions.members.first() ||
      message.guild.members.get(args[0]) ||
      message.guild.members.find(
        target => target.displayName.toLowerCase() === args[0].toLowerCase()
      ) ||
      message.guild.members
        .filter(
          target => target.user.username.toLowerCase() === args[0].toLowerCase()
        )
        .first()

    if (!target)
      return message.channel.send("I can't find such server member :<")

    if (target.id === client.user.id)
      return message.channel.send(
        `${sender}, aww you're such a cutie! Thank you for appreciating me **(๑˃̵ᴗ˂̵)ﻭ**`
      )
    if (target.id === sender.id)
      return message.channel.send(
        `Hey, everyone! Look here, **${sender.username}** just tried hugging themselves! Let's give this poor human some love and hug them!!!`
      )

    let hugRandom = Math.floor(Math.random() * hugMessages.length)
    let hugReply = hugMessages[hugRandom]
      .replace('%%target%%', target)
      .replace('%%sender%%', sender.username)
    message.channel.send(hugReply)
  } catch (e) {
    message.channel.send(
      `I actually have no idea how this happened, but here's an error: \n${e}`
    )
  }
}

module.exports.help = {
  name: 'hug',
  help: {
    desc: 'Hugs a user.',
    usage: 'hug [user]'
  }
}
