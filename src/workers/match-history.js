const moment = require('moment')
const puppeteer = require('puppeteer')

const url = 'https://www.hotslogs.com/Player/MatchHistory?PlayerID='
const options = { waitUntil: 'networkidle', networkIdleTimeout: 5000 }
const gameTypes = ['Quick Match', 'Unranked Draft', 'Hero League', 'Team League', 'Brawl']

const heading = () => document
  .getElementById('h1Title').textContent.split(':')[1]

const dropdown = text => {
  const item = Array
    .from(document.querySelectorAll('.rddlItem'))
    .find(item => item.textContent && item.textContent.trim() === text)

  if (!item) return 1
  if (item.classList.contains('rddlItemSelected')) return 0

  item.click()
  return 2
}

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
  const result = await Promise.all(gameTypes.map(async type => {
    const browser = await puppeteer.launch({ headless })
    const page = await browser.newPage()

    await page.goto(url + playerId, options)
    const name = await page.evaluate(heading)

    await page.evaluate(dropdown, '한국어')
    await page.waitForNavigation(options)

    const status = await page.evaluate(dropdown, type)
    if (status === 1) return {}
    if (status === 2) await page.waitForNavigation(options)

    const matches = (await page.evaluate(columns)).map(histories)
    const [gamesPlayed, winPercent] = await page.evaluate(numbers)

    await browser.close()
    return { [type]: { gamesPlayed, winPercent, matches, name } }
  }))

  return Object.assign({}, ...result)
}

module.exports = matchHistory
