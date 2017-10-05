const puppeteer = require('puppeteer')
const url = 'https://www.hotslogs.com/Player/MatchHistory?PlayerID='

const dropdown = text => Array
  .from(document.querySelectorAll('.rddlItem'))
  .forEach(item => item.textContent === text && item.click())

const numbers = () => Array
  .from(document.querySelectorAll('.RadGridMatchHistoryFooter strong'))
  .map(number => parseInt(number.textContent))

const columns = () => Array
  .from(document.querySelectorAll('.dataTable tbody tr'))
  .map(row => Array.from(row.getElementsByTagName('td')).map(c => c.textContent))

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

async function run (playerId, lang = 'English') {
  const browser = await puppeteer.launch()
  const options = { waitUntil: 'networkidle' }

  const page = await browser.newPage()
  await page.goto(url + playerId, options)

  if (lang !== 'English') {
    await page.evaluate(dropdown, lang)
    await page.waitForNavigation(options)
  }

  await page.evaluate(dropdown, 'Quick Match')
  await page.waitForNavigation(options)

  const matches = (await page.evaluate(columns)).map(histories)
  const [gamesPlayed, winPercent] = await page.evaluate(numbers)

  await browser.close()
  return { gamesPlayed, winPercent, matches }
}

run(8816804, '한국어')
  .then(res => console.log(res))
  .catch(err => console.error(err))
