const hugMessages = require('../modules/jsons/hug_messages.json')

module.exports.run = async (client, message, args) => {
  let sender = message.author
  let target =
    message.mentions.users.first() || message.guild.members.get(args[0])

  try {
    if (!target) return message.channel.send("I can't find such user :<")

    if (target.id == client.user.id)
      return message.channel.send(
        `${sender}, aww you're such a cutieee! Thank you for appreciating me **(๑˃̵ᴗ˂̵)ﻭ**`
      )
    if (target.id == sender.id)
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
  name: 'hug'
}
