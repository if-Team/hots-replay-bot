const puppeteer = require('puppeteer')
const url = 'https://www.hotslogs.com/Player/MatchHistory?PlayerID='

const dropdown = () => Array
  .from(document.querySelectorAll('.rddlItem'))
  .find(item => item.textContent === 'Quick Match').click()

const numbers = () => Array
  .from(document.querySelectorAll('.RadGridMatchHistoryFooter strong'))
  .map(number => parseInt(number.textContent))

const columns = () => Array
  .from(document.querySelectorAll('.dataTable tbody tr'))
  .map(row => Array.from(row.getElementsByTagName('td')).map(c => c.textContent))

const histories = cols => cols.map(col => ({
  replayId: parseInt(col[1]),
  mapName: col[2],
  length: col[3],
  hero: col[4],
  level: parseInt(col[6]),
  result: col[7] === '1',
  mmr: parseInt(col[8]),
  mmrDiff: parseInt(col[9]),
  date: col[10]
}))

async function run (playerId) {
  const browser = await puppeteer.launch()
  const options = { waitUntil: 'networkidle' }

  const page = await browser.newPage()
  await page.goto(url + playerId, options)

  await page.evaluate(dropdown)
  await page.waitForNavigation(options)

  const matches = histories(await page.evaluate(columns))
  const [gamesPlayed, winPercent] = await page.evaluate(numbers)

  await browser.close()
  return { gamesPlayed, winPercent, matches }
}

run(8816804)
  .then(res => console.log(res))
  .catch(err => console.error(err))
