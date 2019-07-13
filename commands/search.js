const config = require("../config.json");
const request = require("request");
const Discord = require("discord.js");
const {
  promisify
} = require('util');
const boards = ["desktop", "ios", "linux", "android", "store", "web", "overlay"]

const requestPromise = promisify(request)

module.exports.run = async (client, message, args) => {
  const labelSeverity = ["red", "orange", "yellow", "green"]
  const emotesSeverity = [client.parseEmoji("p0"), client.parseEmoji("p1"), client.parseEmoji("p2"), client.parseEmoji("p3")]
  const labelPriority = ["sky", "lime", "pink"]
  const emotesPriority = [client.parseEmoji("low"), client.parseEmoji("mid"), client.parseEmoji("high")]
  let board = args[0]
  let input = args.slice(1).join(" ")
  if (!boards.includes(board.toLowerCase())) {
    return message.channel.send("Not a valid board.")
  }
  var boardID
  switch (board.toLowerCase()) {
    case "desktop":
      boardID = config.trello.desktop_bugs
      break;
    case "ios":
      boardID = config.trello.ios_bugs
      break;
    case "linux":
      boardID = config.trello.linux_bugs
      break;
    case "android":
      boardID = config.trello.android_bugs
      break;
    case "store":
      boardID = config.trello.store_bugs
      break;
    case "web":
      boardID = config.trello.website_bugs
      break;
    case "overlay":
      boardID = config.trello.overlay_bugs
      break;
    default:
      boardID = config.trello.desktop_bugs
  }
  var resultsEmbed = new Discord.RichEmbed()

  let currentPage = 0

  const requestSearch = async (page) => {
    var options = {
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
    };
    const result = JSON.parse((await requestPromise(options)).body)
    return result.cards
  }

  let botMsg = null

  const renderSearch = async (cards) => {
    if (cards.length > 1 || currentPage !== 0) {
      var cardsDone = []
      cards.forEach(card => {
        cardsDone.push(`**${card.name}**\nLink: ${card.shortUrl}`)
      })
      let forwardEmoji = '▶'
      let backwardEmoji = '◀'
      resultsEmbed.setTitle(`Results (page ${currentPage + 1}):`)
      resultsEmbed.setDescription(cardsDone.join('\n\n'))
      resultsEmbed.setColor("#ff3535")
      resultsEmbed.setFooter(`Executed by ${message.author.tag}`, message.author.avatarURL)
      if (botMsg == null) {
        botMsg = await message.channel.send(resultsEmbed)
        var backwardReaction = await botMsg.react(backwardEmoji)
        var forwardReaction = await botMsg.react(forwardEmoji)
        const filter = (reaction, user) => user.id === message.author.id
        const collector = botMsg.createReactionCollector(filter, {
          time: 60000
        })
        collector.on('collect', async (r) => {
          switch (r.emoji.name) {
            case forwardEmoji:
              var ForwardUserReaction = r.message.reactions.filter(r => r._emoji.name === forwardEmoji)
              ForwardUserReaction.first().remove(message.author)
              currentPage++
              const searchResults = await requestSearch(currentPage)
              if (searchResults.length === 0) {
                currentPage--
                return
              }
              renderSearch(searchResults)
              break;
            case backwardEmoji:
              var BackwardUserReaction = r.message.reactions.filter(r => r._emoji.name === backwardEmoji)
              BackwardUserReaction.first().remove(message.author)
              if (currentPage === 0) {
                return
              }
              currentPage--
              renderSearch(await requestSearch(currentPage))
              break;
            default:
              break;
          }
        })
        collector.on('end', c => {
          backwardReaction.remove(client.user)
          forwardReaction.remove(client.user)
        })
        client.queries++
      } else {
        botMsg.edit(resultsEmbed)
      }
    } else {
      if (cards.length === 0) {
        return message.channel.send("No results returned.")
      }
      var optionstwo = {
        method: 'GET',
        url: `https://api.trello.com/1/cards/${cards[0].id}/list`,
        qs: {
          fields: 'all',
          key: process.env.TRELLO_KEY,
          token: process.env.TRELLO_TOKEN
        }
      };
      request(optionstwo, async function (error, response, bodytwo) {
        let one = cards[0].desc.replace(/####Steps to reproduce:/g, "➤ __**Steps to reproduce:**__")
        let two = one.replace(/####Expected result:/g, "➤ __**Expected result:**__")
        let three = two.replace(/####Actual result:/g, "➤ __**Actual result:**__")
        let four = three.replace(/####Client settings:/g, "➤ __**Client settings:**__")
        let final = four.replace(/####System settings:/g, "➤ __**System settings:**__")
        var labels = []
        if (cards[0].labels.length !== 0) {
          if (cards[0].labels.length === 1) {
            labels.push(emotesSeverity[labelSeverity.indexOf(cards[0].labels[0].color)])
          } else {
            cards[0].labels.forEach(label => {
              if (labelSeverity.includes(label.color)) {
                labels.push(emotesSeverity[labelSeverity.indexOf(label.color)])
              }
              if (labelPriority.includes(label.color)) {
                labels.push(emotesPriority[labelPriority.indexOf(label.color)])
              }
            })
          }
        }
        let finalLabels = labels.join(" ")
        await message.channel.send("Here you go, here's what I found:")
        if (cards[0].attachments.length !== 0) {
          await resultsEmbed.setImage(cards[0].attachments[0].url)
        }
        if (cards[0].name.length > 250) {
          await resultsEmbed.setTitle(cards[0].name.substring(0, 247) + "...")
        } else {
          await resultsEmbed.setTitle(cards[0].name)
        }
        await resultsEmbed.setDescription(`Labels: ${finalLabels}\nList: ${JSON.parse(bodytwo).name}\nArchived: ${cards[0].closed}\n\n${final}\n\nLink: ${cards[0].shortUrl}`)
        await resultsEmbed.setColor("#ff3535")
        await resultsEmbed.setFooter(`Executed by ${message.author.tag}`, message.author.avatarURL)
        await message.channel.send(resultsEmbed)
        await client.queries++
      })
    }
  };
  renderSearch(await requestSearch(0))
}

module.exports.help = {
  name: "search"
}
