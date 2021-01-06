/* eslint-disable semi */

const jwt = require('jsonwebtoken')

function truncateAllTables(db) {
  return db.raw(`TRUNCATE mashes, users RESTART IDENTITY CASCADE;`)
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

function makeMashesSerialized(testMashes) {
  testMashes.forEach((mash) => {
    mash.username = 'test-user-1'
    mash.votes = 1
  })
}

module.exports = { truncateAllTables, makeAuthHeader, makeMashesSerialized }
        // makeMashesSerialized(testMashes)