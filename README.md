# bug-searching-tool

<p>
  <a href="./LICENSE">
    <img alt="MIT License" src="https://img.shields.io/badge/License-MIT-yellow.svg">
  </a>
    <a href="https://prettier.io/">
    <img alt="Codestyle: Prettier" src="https://img.shields.io/badge/codestyle-prettier-ff69b4.svg">
  </a>
    </a>
    <a href="https://travis-ci.com/Rage0001/bug-searching-tool">
    <img alt="Build Status" src="https://travis-ci.com/Rage0001/bug-searching-tool.svg?branch=master">
  </a>
</p>

A bot useful for Bug Hunters to search bugs from the Trello boards.

- Speedy search
- Get faster results than Ctrl + F on the board
- Mobile friendly

### Hosting yourself

Dependancies:
- [NodeJS](https://nodejs.org/en/): 10+
- [Git](https://git-scm.com/downloads): 2.9+


1. Clone the repository.

```sh
$ git clone https://github.com/Rage0001/bug-searching-tool
```

2. Install the requried dependencies.

```sh
$ npm install
```

3. Open the config.json file and fill in the fields for Emojis, Prefix, and Watching Status. *board IDs are already set.*
4. Rename `.env.example` to `.env` and fill in the fields within it:
    - Head over to [Discord Dev Applications](https://discordapp.com/developers/applications/) to get BOT_TOKEN
    - Head over to [Trello app-key](https://trello.com/app-key) to get your TRELLO_KEY and TRELLO_TOKEN.
5. Launch the bot.

```sh
$ node bot.js
```
