module.exports = db => ctx => {
  const subscription = db.get('chats')
    .find({ id: ctx.chat.id })
    .value()

  if (subscription) {
    ctx.reply(`Already subscribed since ${subscription.date}`)
    return
  }

  db.get('chats')
    .push({ id: ctx.chat.id, date: new Date() })
    .write()

  ctx.reply(`Subscribed ${ctx.chat.id} chat.\n/unsubscribe to cancel subscription`)
}
