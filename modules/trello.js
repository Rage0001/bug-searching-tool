const request = require('request')
const { promisify } = require('util')

const requestPromise = promisify(request)

module.exports.trelloSearch = async (input, boardID, page) => {
  let options = {
    method: 'GET',
    url: 'https://api.trello.com/1/search',
    qs: {
      query: input,
      idBoards: boardID,
      modelTypes: 'cards',
      boards_limit: '1',
      card_fields: 'desc,name,shortUrl,labels,closed',
      cards_limit: '5',
      cards_page: String(page),
      card_list: 'false',
      card_members: 'false',
      card_stickers: 'false',
      card_attachments: 'true',
      organization_fields: 'name,displayName',
      organizations_limit: '10',
      member_fields: 'avatarHash,fullName,initials,username,confirmed',
      members_limit: '10',
      partial: 'false',
      key: process.env.TRELLO_KEY,
      token: process.env.TRELLO_TOKEN
    }
  }
  const result = JSON.parse((await requestPromise(options)).body)
  return result.cards
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

module.exports.formatDescription = async desc => {
  let formatted = desc
    .replace(/####Steps to reproduce:/g, '➤ __**Steps to reproduce:**__')
    .replace(/####Expected result:/g, '➤ __**Expected result:**__')
    .replace(/####Actual result:/g, '➤ __**Actual result:**__')
    .replace(/####Client settings:/g, '➤ __**Client settings:**__')
    .replace(/####System settings:/g, '➤ __**System settings:**__')
  return formatted
}
