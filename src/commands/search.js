const axios = require('axios')

const regions = { US: 1, EU: 2, KR: 3, CN: 4 }
const url = 'https://api.hotslogs.com/Public/Players'

module.exports = db => async ctx => {
  const { command } = ctx.state
  if (command.splitArgs.length < 2) return ctx.reply('Usage: /search <US|EU|KR|CN> <BattleTag#1234>')

  const region = regions[command.splitArgs[0].toUpperCase()]
  const battleTag = encodeURIComponent(command.splitArgs[1].split('#').join('_'))

  const { data } = await axios(`${url}/${region}/${battleTag}`)
  ctx.reply(`PlayerID of ${command.splitArgs[1]} is: ${data.PlayerID}`)
}
