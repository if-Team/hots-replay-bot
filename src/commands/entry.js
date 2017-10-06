const matchHistory = require('../workers/match-history')

module.exports = db => async ctx => {
  const { command, subscription } = ctx.state
  if (!subscription) return ctx.reply('Please /subscribe first!')
  if (!command.args) return ctx.reply('Usage: /entry <PlayerID>')

  const playerId = parseInt(command.splitArgs[0])

  const result = await matchHistory(playerId, '한국어')
  ctx.reply(Object.keys(result).map(m => `${m}\n플레이한 게임: ${result[m].gamesPlayed}, 승률 ${result[m].winPercent}%\n최근 게임: ${JSON.stringify(result[m].matches[0])}`).join('\n\n'))

  const entry = db.get('entries')
    .find({ playerId })
    .value()

  if (entry) {
    db.get('entries')
      .remove({ playerId })
      .write()

    return ctx.reply(`Removed entry: PlayerID ${playerId}`)
  }

  db.get('entries')
    .push({ playerId, date: new Date() })
    .write()

  ctx.reply(`Added entry: PlayerID ${playerId}`)
}
