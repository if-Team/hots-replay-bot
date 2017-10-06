const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

module.exports = path => low(new FileSync(path))
