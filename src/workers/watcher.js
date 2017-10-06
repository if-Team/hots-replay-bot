module.exports = (app, db) => {
  console.log(db.get('entries').value())
}
