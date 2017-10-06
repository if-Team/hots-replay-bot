module.exports = db => ctx => {
  const subscription = db.get('chats')
    .find({ id: ctx.chat.id })
    .value()

  if (!subscription) {
    ctx.reply(`You are not subscribed yet.\n/subscribe to get started.`)
    return
  }

  db.get('chats')
    .remove({ id: ctx.chat.id })
    .write()

  ctx.reply(`Unsubscribed ${ctx.chat.id} successfully.`)
}
