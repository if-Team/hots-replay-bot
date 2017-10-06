module.exports = db => ctx => {
  const { command, subscription } = ctx.state
  if (!subscription) return ctx.reply('Please /subscribe first!')
  if (!command.args) return ctx.reply('Usage: /entry <PlayerID>')

  const playerId = parseInt(command.splitArgs[0])
  const entry = db.get('entries')
    .find({ playerId })
    .value()

  if (entry) {
    db.get('entries')
      .remove({ playerId })
      .write()

    return ctx.reply(`Removed entry: PlayerID ${playerId}`)
  }

  db.get('entries')
    .push({ playerId, date: new Date() })
    .write()

  ctx.reply(`Added entry: PlayerID ${playerId}`)
}
