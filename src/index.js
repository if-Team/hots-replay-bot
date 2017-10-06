require('dotenv').config()
const LocalStorage = require('./local-storage')

const Telegraf = require('telegraf')
const commandParts = require('telegraf-command-parts')

const entryCommand = require('./commands/entry')
const subscribeCommand = require('./commands/subscribe')
const unsubscribeCommand = require('./commands/unsubscribe')

async function start () {
  const db = LocalStorage(process.env.DB_PATH)
  db.defaults({ chats: [] }).write()

  const app = new Telegraf(process.env.BOT_TOKEN)
  app.options.username = (await app.telegram.getMe()).username

  app.use(commandParts())
  app.use((ctx, next) => {
    ctx.state.subscription = db
      .get('chats')
      .find({ id: ctx.chat.id })
      .value()

    return next()
  })

  app.command('subscribe', subscribeCommand(db))
  app.command('unsubscribe', unsubscribeCommand(db))
  app.command('entry', entryCommand(db))

  app.startPolling()
}

start()
  .then(console.log)
  .catch(console.error)
