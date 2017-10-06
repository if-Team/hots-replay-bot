const moment = require('moment')
const puppeteer = require('puppeteer')

const url = 'https://www.hotslogs.com/Player/MatchHistory?PlayerID='
const options = { waitUntil: 'networkidle', networkIdleTimeout: 1000 }
const gameTypes = ['Quick Match', 'Unranked Draft', 'Hero League', 'Team League', 'Brawl']

const heading = () => document
  .getElementById('h1Title').textContent.split(':')[1].trim()

const dropdown = text => Array
  .from(document.querySelectorAll('.rddlItem'))
  .find(item => item.textContent && item.textContent.trim() === text).click()

const numbers = () => Array
  .from(document.querySelectorAll('.RadGridMatchHistoryFooter strong'))
  .map(number => parseFloat(number.textContent))

const columns = () => Array
  .from(document.querySelectorAll('.dataTable tbody tr'))
  .map(r => Array.from(r.getElementsByTagName('td')).map(c => c.textContent))

const histories = col => ({
  replayId: parseInt(col[1]),
  mapName: col[2],
  length: col[3],
  hero: col[4],
  level: parseInt(col[6]),
  result: col[7] === '1',
  mmr: parseInt(col[8]),
  mmrDiff: parseInt(col[9]),
  date: moment(col[10], 'YYYY-MM-DD A hh:mm:ss').toISOString()
})

async function matchHistory (playerId, headless = true) {
  const browser = await puppeteer.launch({ headless })
  const result = await Promise.all(gameTypes.map(async type => {
    const page = await browser.newPage()

    await page.goto(url + playerId, options)
    const name = await page.evaluate(heading)

    await page.evaluate(dropdown, '한국어')
    await page.waitForNavigation(options)

    try {
      await page.evaluate(dropdown, type)
      await page.waitForNavigation(options)
    } catch (err) { return {} }

    const matches = (await page.evaluate(columns)).map(histories)
    const [gamesPlayed, winPercent] = await page.evaluate(numbers)

    return { [gameType]: { gamesPlayed, winPercent, matches, name } }
  }))

  await browser.close()
  return Object.assign({}, ...result)
}

module.exports = matchHistory
