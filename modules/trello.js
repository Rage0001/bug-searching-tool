const request = require('request')
const { promisify } = require('util')

const requestPromise = promisify(request)

module.exports.trelloSearch = async (input, boardID, page) => {
  let options = {
    method: 'GET',
    url: 'https://gnk.gnk.io/dtesters/search',
    qs: {
      limit: 5,
      page: page,
      board: boardID,
      kind: 'approve',
      sort: 'relevance',
      include: 'title,card,link',
      highlights: 'first'
    }
  }
  if (input.startsWith('>')) {
    options.qs.query = input.slice(1).trim()
  } else {
    options.qs.content = input
  }
  const result = JSON.parse((await requestPromise(options)).body)
  return result
}

module.exports.getListName = async cardID => {
  let options = {
    method: 'GET',
    url: `https://api.trello.com/1/cards/${cardID}/list`,
    qs: {
      fields: 'all',
      key: process.env.TRELLO_KEY,
      token: process.env.TRELLO_TOKEN
    }
  }

  const result = JSON.parse((await requestPromise(options)).body)
  return result.name
}

module.exports.getTicket = async cardID => {
  let options = {
    method: 'GET',
    url: `https://api.trello.com/1/cards/${cardID}`,
    qs: {
      fields: 'desc,name,shortUrl,labels,closed',
      attachments: 'true',
      attachment_fields: 'all',
      members: 'false',
      membersVoted: 'false',
      checkItemStates: 'false',
      checklists: 'none',
      checklist_fields: 'all',
      board: 'true',
      board_fields: 'name,url',
      list: 'true',
      pluginData: 'false',
      stickers: 'false',
      sticker_fields: 'all',
      customFieldItems: 'false',
      key: process.env.TRELLO_KEY,
      token: process.env.TRELLO_TOKEN
    }
  }

  const body = (await requestPromise(options)).body
  let result
  try {
    result = JSON.parse(body)
  } catch (e) {
    result = false
  }
  return result
}

module.exports.getComments = async cardID => {
  var boardIDs = [
    '5771673855f47b547f2decc3',
    '57f2d333b99965a6ba8cd7e0',
    '5bc7b4adf7d2b839fa6ac108',
    '57f2a306ca14741151990900',
    '5846f7fdfa2f44d1f47267b0',
    '5cbfb347e17452475d790070',
    '5cc22e6be84de608c791fdb6'
  ]

  var options = {
    method: 'GET',
    url: `https://api.trello.com/1/cards/${cardID}/actions?filter=commentCard&alimit=1`,
    qs: {
      key: process.env.TRELLO_KEY,
      token: process.env.TRELLO_TOKEN
    }
  }

  var result = JSON.parse((await requestPromise(options)).body)

  if (!boardIDs.includes(result[0].data.board.id)) {
    result = null
  }

  return result
}

module.exports.getReproRatio = async comments => {
  var crs = 0
  var cnrs = 0
  comments.forEach(comment => {
    if (comment.memberCreator.id !== '58c07cf2115d7e5848862195') return
    if (comment.data.text.includes('Can reproduce.')) {
      crs = crs + 1
    } else if (comment.data.text.includes(`Can't reproduce.`)) {
      cnrs = cnrs + 1
    }
  })
  return { crs, cnrs }
}

module.exports.filterComments = async comments => {
  let userComments = []
  let adminComments = []
  comments.forEach(comment => {
    if (comment.memberCreator.id === '58c07cf2115d7e5848862195') {
      if (comment.data.text.includes('Can reproduce.')) return
      if (comment.data.text.includes("Can't reproduce.")) return
      userComments.push(comment.data.text)
    } else {
      adminComments.push(
        `${comment.data.text}\n\n${comment.memberCreator.fullName}`
      )
    }
  })
  return { userComments, adminComments }
}

module.exports.formatDescription = async desc => {
  let formatted = desc
    .replace(/####Steps to reproduce:/g, '➤ __**Steps to reproduce:**__')
    .replace(/####Expected result:/g, '➤ __**Expected result:**__')
    .replace(/####Actual result:/g, '➤ __**Actual result:**__')
    .replace(/####Client settings:/g, '➤ __**Client settings:**__')
    .replace(/####System settings:/g, '➤ __**System settings:**__')
  return formatted
}

module.exports.urlRegex = trelloURL => {
  return trelloURL.match(
    /(?:(?:<)?(?:https?:\/\/)?(?:www\.)?trello.com\/c\/)?([^\/|\s|\>]+)(?:\/|\>)?(?:[\w-\d]*)?(?:\/|\>|\/>)?\s*\|?\s*([\s\S]*)/i
  )
}

module.exports.getTotalRepros = async type => {
  let options = {
    method: 'GET',
    url: 'https://gnk.gnk.io/dtesters/total',
    qs: {
      kind: type
    }
  }
  const result = JSON.parse((await requestPromise(options)).body)
  return result
}

module.exports.getUserRepros = async (userTag, type) => {
  let options = {
    method: 'GET',
    url: 'https://gnk.gnk.io/dtesters/total',
    qs: {
      kind: type,
      user: userTag
    }
  }
  const result = JSON.parse((await requestPromise(options)).body)
  return result
}

module.exports.getUserBoardRepros = async (userTag, type) => {
  let boardIDs = [
    '5771673855f47b547f2decc3',
    '57f2d333b99965a6ba8cd7e0',
    '5bc7b4adf7d2b839fa6ac108',
    '57f2a306ca14741151990900',
    '5846f7fdfa2f44d1f47267b0',
    '5cbfb347e17452475d790070',
    '5cc22e6be84de608c791fdb6'
  ]

  let boardNames = [
    'Desktop',
    'iOS',
    'Store',
    'Android',
    'Linux',
    'Overlay',
    'Web'
  ]

  let collected = []

  for (let i = 0; i < boardIDs.length; i++) {
    let options = {
      method: 'GET',
      url: 'https://gnk.gnk.io/dtesters/total',
      qs: {
        kind: type,
        user: userTag,
        board: boardIDs[i]
      }
    }
    const result = JSON.parse((await requestPromise(options)).body)
    result.board = boardNames[boardIDs.indexOf(boardIDs[i])]
    collected.push(result)
  }

  return collected
}

module.exports.getBoardRepros = async type => {
  let boardIDs = [
    '5771673855f47b547f2decc3',
    '57f2d333b99965a6ba8cd7e0',
    '5bc7b4adf7d2b839fa6ac108',
    '57f2a306ca14741151990900',
    '5846f7fdfa2f44d1f47267b0',
    '5cbfb347e17452475d790070',
    '5cc22e6be84de608c791fdb6'
  ]

  let boardNames = [
    'Desktop',
    'iOS',
    'Store',
    'Android',
    'Linux',
    'Overlay',
    'Web'
  ]

  let collected = []

  for (let i = 0; i < boardIDs.length; i++) {
    let options = {
      method: 'GET',
      url: 'https://gnk.gnk.io/dtesters/total',
      qs: {
        kind: type,
        board: boardIDs[i]
      }
    }
    const result = JSON.parse((await requestPromise(options)).body)
    result.board = boardNames[boardIDs.indexOf(boardIDs[i])]
    collected.push(result)
  }

  return collected
}
