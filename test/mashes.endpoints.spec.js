/* eslint-disable semi */
const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeMashesArray, makeMaliciousMash } = require('./mashes.fixtures')
const { makeUsersArray } = require('./users.fixtures')
const { truncateAllTables } = require('./test-helpers')

describe('Mashes Endpoints', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  before('clean the table', () => truncateAllTables(db))

  afterEach('cleanup', () => truncateAllTables(db))

  after('disconnect from db', () => db.destroy())

  describe('GET /api/mashes', () => {
    context(`Given no mashes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get('/api/mashes').expect(200, [])
      })
    })

    context('Given there are mashes in the database', () => {
      const testUsers = makeUsersArray()
      const testMashes = makeMashesArray()

      beforeEach('insert mashes', () => {
        return db
          .into('users')
          .insert(testUsers)
          .then(() => {
            return db.into('mashes').insert(testMashes)
          })
      })

      it('responds with 200 and all of the mashes', () => {
        return supertest(app).get('/api/mashes').expect(200, testMashes)
      })
    })

    context(`Given an XSS attack mash`, () => {
      const testUsers = makeUsersArray()
      const { maliciousMash, expectedMash } = makeMaliciousMash()

      beforeEach('insert malicious mash', () => {
        return db
          .into('users')
          .insert(testUsers)
          .then(() => {
            return db.into('mashes').insert([maliciousMash])
          })
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get('/api/mashes')
          .expect(200)
          .expect((res) => {
            expect(res.body[0].game_title).to.eql(expectedMash.game_title)
            expect(res.body[0].notes).to.eql(expectedMash.notes)
          })
      })
    })
  })

  describe(`GET /api/mashes/:mash_id`, () => {
    context(`Given no mashes`, () => {
      it(`responds with 404`, () => {
        const mashId = 123456
        return supertest(app)
          .get(`/api/mashes/${mashId}`)
          .expect(404, { error: { message: `Mash does not exist` } })
      })
    })

    context('Given there are mashes in the database', () => {
      const testUsers = makeUsersArray()
      const testMashes = makeMashesArray()

      beforeEach('insert mashes', () => {
        return db
          .into('users')
          .insert(testUsers)
          .then(() => {
            return db.into('mashes').insert(testMashes)
          })
      })

      it('ressonds with 200 and the specified mash', () => {  //THIS RESPONDS WITH AN ERROR BECAUSE OF THE EMPTY BINDS KEY
        const mashId = 2
        const expectedMash = testMashes[mashId - 1]
        return supertest(app)
          .get(`/api/mashes/${mashId}`)
          .expect(200, expectedMash)
      })
    })
  })
})
