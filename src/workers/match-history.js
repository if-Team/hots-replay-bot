const puppeteer = require('puppeteer')
const options = { waitUntil: 'networkidle' }

const url = 'https://www.hotslogs.com/Player/MatchHistory?PlayerID='
const gameTypes = [
  'Team League', 'Hero League', 'Unranked Draft', 'Quick Match', 'Brawl']

const dropdown = text => Array
  .from(document.querySelectorAll('.rddlItem'))
  .find(item => item.textContent === text).click()

const numbers = () => Array
  .from(document.querySelectorAll('.RadGridMatchHistoryFooter strong'))
  .map(number => parseInt(number.textContent))

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
  date: col[10]
})

async function matchHistory (playerId, lang = 'English', headless = true) {
  const browser = await puppeteer.launch({ headless })
  const result = await Promise.all(gameTypes.map(async gameType => {
    const page = await browser.newPage()
    await page.goto(url + playerId, options)

    if (lang !== 'English') {
      await page.evaluate(dropdown, lang)
      await page.waitForNavigation(options)
    }

    await page.evaluate(dropdown, gameType)
    await page.waitForNavigation(options)

    const matches = (await page.evaluate(columns)).map(histories)
    const [gamesPlayed, winPercent] = await page.evaluate(numbers)

    return { [gameType]: { gamesPlayed, winPercent, matches } }
  }))

  await browser.close()
  return Object.assign({}, ...result)
}

module.exports = matchHistory
