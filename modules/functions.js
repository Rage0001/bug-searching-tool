module.exports = client => {
  client.parseEmoji = name => {
    let emojiID = client.config.get(`emotes.${name}`)
    let emoji = client.emojis.get(emojiID)
    return `<:${emoji.name}:${emoji.id}>`
  }
}
