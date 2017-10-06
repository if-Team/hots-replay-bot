const matchHistory = require('../workers/match-history')
const url = 'https://www.hotslogs.com/Player/MatchSummaryContainer?ReplayID='
const gameTypes = { 'Quick Match': '빠른 대전', 'Unranked Draft': '일반 선발전', 'Hero League': '영웅 리그', 'Team League': '팀 리그', 'Brawl': '난투' }

const moment = require('moment')
moment.locale('ko')

module.exports = db => async ctx => {
  const { command } = ctx.state
  if (!command.args) return ctx.reply('Usage: /status <PlayerID>')

  try {
    const playerId = parseInt(command.splitArgs[0])
    ctx.reply(`Getting information of PlayerID ${playerId}...`)

    const data = await matchHistory(playerId)
    const messages = Object.keys(data).map(type => {
      const { name, gamesPlayed, winPercent, matches } = data[type]
      const { replayId, hero, mapName, result, length, date, mmr, mmrDiff, level } = matches[0]

      const levelMessage = isNaN(level) ? '' : ` Lvl.${level}`
      const mmrMessage = isNaN(mmr) ? '정보 없음' : `${mmr} (${mmrDiff > 0 ? '+' : ''}${mmrDiff})`

      return `${name}님의 ${gameTypes[type]}\n` +
        `- 플레이한 게임: ${gamesPlayed}, 승률: ${winPercent}%\n` +
        `- 최근 게임:\n` +
        `   - ${result ? '승리' : '패배'}: ${mapName}에서 ${hero}${levelMessage}\n` +
        `   - ${moment(date).fromNow()}, MMR: ${mmrMessage}, ${length} [🔗](${url}${replayId})`
    })

    ctx.reply(messages.join('\n\n'), { parse_mode: 'Markdown' })
  } catch (err) {
    console.error(err)
    ctx.reply('Error occurred: ' + err.messages)
  }
}
