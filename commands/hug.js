const config = require('../config.json')
const Discord = require('discord.js')
const hugMessages = require("../modules/jsons/hug_messages.json")

module.exports.run = async (client, message, args) => {
    let sender = message.author;
    let target = message.mentions.users.first() || message.guild.members.get(args[0]);

    try {
        if (!target) // checking if the argument was correctly specified
            return message.channel.send("I can't find such user :<");

        if (target.id == client.user.id) // Checks if the sender tries to hug me, a little botto :3
            return message.channel.send(`${sender}, aww you're such a cutieee! Thank you for appreciating me **(๑˃̵ᴗ˂̵)ﻭ**`);
        if (target.id == sender.id) // Checking if the sender tries to hug themselves
            return message.channel.send(`Hey, everyone! Look here, **${sender.username}** just tried hugging themselves! Let's give this poor human some love and hug them!!!`);

        let hugRandom = Math.floor((Math.random() * hugMessages.length)); // doing some magic with a list of messages (randomizing)
        let hugReply = hugMessages[hugRandom].replace('%%target%%', target).replace('%%sender%%', sender.username); // replacing some things from the json to the actual variables, ty Rage <3
        message.channel.send(hugReply); // hugging a hooman!!!
    } catch (e) {
        message.channel.send(`I actually have no idea how this happened, but here's an error: \n${e}`); // in case if bad stuff happens
    }
}

module.exports.help = {
    name: 'hug'
}
