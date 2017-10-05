require('dotenv').config()

const Telegraf = require('telegraf')
const LocalSession = require('telegraf-session-local')

async function start () {
  const app = new Telegraf(process.env.BOT_TOKEN)
  app.use(new LocalSession({ database: process.env.DB_PATH }).middleware())
  app.options.username = (await app.telegram.getMe()).username

  app.command('start', ctx => {
    ctx.session.count = ctx.session.count || 0
    ctx.reply(`hello ${++ctx.session.count}`)
  })

  app.startPolling()
}

start()
  .then(console.log)
  .catch(console.error)
