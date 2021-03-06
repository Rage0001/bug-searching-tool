require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const fs = require('fs')
require('./modules/functions.js')(client)
const editor = require('edit-json-file')
const config = editor('./config.json', {
  autosave: true
})

client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()
client.config = config
client.emojiChars = require('./modules/emojiChars.js')

fs.readdir('./commands/', (err, files) => {
  if (err) return console.error(err)
  files.forEach(file => {
    if (!file.endsWith('.js')) return
    let props = require(`./commands/${file}`)
    let commandName = file.split('.')[0]
    console.log(`* ${commandName}`)
    client.commands.set(commandName, props)
    if (props.help.aliases) {
      props.help.aliases.forEach(alias => {
        client.aliases.set(alias, props.help.name)
      })
    }
  })
})

fs.readdir('./events/', (err, files) => {
  if (err) return console.error(err)
  files.forEach(file => {
    const event = require(`./events/${file}`)
    let eventName = file.split('.')[0]
    client.on(eventName, event.bind(null, client))
  })
})

client.login(process.env.BOT_TOKEN)

process.on('unhandledRejection', err => {
  console.error(`Uncaught Promise Rejection: \n${err.stack}`)
})

process.on('uncaughtException', err => {
  console.error(`Uncaught Exception: \n${err.stack}`)
})
