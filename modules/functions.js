module.exports = client => {
  client.parseEmoji = name => {
    let emojiID = client.config.get(`emojis.${name}`)
    let emoji = client.emojis.get(emojiID)
    if (emoji) return `<:${emoji.name}:${emoji.id}>`
    else {
      console.log(
        `WARNING: Failed to find Emoji for the config variable ${name} - ` +
          `Please make sure that I have access to it, or that the ID of the emoji is correct`
      )
      return `**${name}**`
    }
  }
}
