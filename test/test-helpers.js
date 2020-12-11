/* eslint-disable semi */
function truncateAllTables(db) {
  return db.raw(`TRUNCATE mashes, users RESTART IDENTITY CASCADE;`)
}

module.exports = { truncateAllTables }
