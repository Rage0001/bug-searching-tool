module.exports = async client => {
  console.log(`-------------------\nREADY.`)
  client.user.setActivity(client.config.get('playing_status'), {
    type: 'WATCHING'
  })
}
