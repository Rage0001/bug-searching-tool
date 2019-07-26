module.exports.run = async (client, message, args) => {
  if (message.author.id !== '274651286534619136') return

  try {
    let code = args.join(' ')
    let result = eval(code)

    if (typeof result !== 'string')
      result = require('util').inspect(result, { depth: 0 })
    message.channel.send(result, { code: 'js' })
  } catch (e) {
    message.channel.send(e, { code: 'js' })
  }
}

module.exports.help = {
  name: 'eval',
  help: {
    desc: 'Evaluates JavaScript code.',
    usage: 'eval [code]'
  }
}
