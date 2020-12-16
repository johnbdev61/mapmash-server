/* eslint-disable semi */
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

module.exports = { truncateAllTables, makeAuthHeader }
