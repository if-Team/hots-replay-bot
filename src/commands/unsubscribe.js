module.exports = db => ctx => {
  const { subscription } = ctx.state
  if (!subscription) return ctx.reply(`You are not subscribed yet.`)

  db.get('chats')
    .remove({ id: ctx.chat.id })
    .write()

  ctx.reply(`Unsubscribed ${ctx.chat.id} chat.`)
}
