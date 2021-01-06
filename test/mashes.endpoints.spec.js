/* eslint-disable semi */
const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const {
  makeMashesArray,
  makeBindsArray,
  makeMaliciousMash,
  makeVotesArray,
} = require('./mashes.fixtures')
const { makeUsersArray } = require('./users.fixtures')
const { truncateAllTables, makeAuthHeader } = require('./test-helpers')

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
      const testVotes = makeVotesArray()

      beforeEach('insert mashes', () => {
        return db
          .into('users')
          .insert(testUsers)
          .then(() => {
            return db.into('mashes').insert(testMashes)
          })
          .then(() => {
            return db.into('votes').insert(testVotes)
          })
      })

      it('responds with 200 and all of the mashes', () => {
        testMashes.forEach((mash) => {
          mash.username = 'test-user-1'
          mash.votes = 1
        })
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
      const testBinds = makeBindsArray()

      beforeEach('insert mashes', () => {
        return db
          .into('users')
          .insert(testUsers)
          .then(() => {
            return db.into('mashes').insert(testMashes)
          })
          .then(() => {
            return db.into('bind').insert(testBinds)
          })
      })

      it('responds with 200 and the specified mash', () => {
        const mashId = 2
        const expectedMash = testMashes[mashId - 1]
        expectedMash.binds = testBinds
        return supertest(app)
          .get(`/api/mashes/${mashId}`)
          .expect(200, expectedMash)
      })
    })
    context(`Given an XSS attack mash`, () => {
      //MIGHT HAVE TO REFACTOR FOR BIND KEY ACTIONS
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
          .get(`/api/mashes/${maliciousMash.id}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.game_title).to.eql(expectedMash.game_title)
            expect(res.body.notes).to.eql(expectedMash.notes)
          })
      })
    })
  })

  describe(`POST /api/mashes`, () => {
    context('When posting a mash with required field', () => {
      const testUsers = makeUsersArray()
      const testUser = testUsers[0]
      beforeEach('insert mashes', () => {
        return db.into('users').insert(testUsers)
      })
      it('creates a game, responding with 201 and new mash', () => {
        const newMash = {
          game_title: 'Forza Motorsport 4',
          notes: 'How do you like my driving?',
        }
        return supertest(app)
          .post('/api/mashes')
          .set('Authorization', makeAuthHeader(testUser))
          .send(newMash)
          .expect(201)
          .expect((res) => {
            expect(res.body.game_title).to.eql(newMash.game_title)
            expect(res.body.notes).to.eql(newMash.notes)
            expect(res.body).to.have.property('id')
            expect(res.body.author_id).to.eql(testUser.id)
            expect(res.headers.location).to.eql(`/api/mashes/${res.body.id}`)
            const expected = new Intl.DateTimeFormat('en-US').format(new Date())
            const actual = new Intl.DateTimeFormat('en-us').format(
              new Date(res.body.date_modified)
            )
            expect(actual).to.eql(expected)
          })
          .then((res) => {
            supertest(app).get(`/api/mashes/${res.body.id}`).expect(res.body)
          })
      })
    })
    context('When posting a mash without required field', () => {
      const testUsers = makeUsersArray()
      const testUser = testUsers[0]
      beforeEach('insert mashes', () => {
        return db.into('users').insert(testUsers)
      })
      const requiredField = 'game_title'
      const newMash = {
        game_title: 'Battlefield 4',
        notes: 'This is how I win every game!',
      }

      it(`responds with 400 and an error message when the ${requiredField} is missing`, () => {
        delete newMash[requiredField]

        return supertest(app)
          .post('/api/mashes')
          .set('Authorization', makeAuthHeader(testUser))
          .send(newMash)
          .expect(400, {
            error: { message: `Missing ${requiredField} in request body` },
          })
      })
    })
  })

  describe('DELETE /api/mashes', () => {
    context('Given mash does not exist', () => {
      it('responds with 404', () => {
        const mashId = 123456
        return supertest(app)
          .delete(`/api/mashes/${mashId}`)
          .expect(404, { error: { message: 'Mash does not exist' } })
      })
    })

    context('Given there is a mash in the database matching id', () => {
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

      it('responds with 204 and removes the mash', () => {
        testMashes.forEach((mash) => {
          mash.username = 'test-user-1'
          mash.votes = 0
        })
        const testUsers = makeUsersArray()
        const testUser = testUsers[0]
        const idToRemove = 2
        const expectedMashes = testMashes.filter(
          (mash) => mash.id !== idToRemove
        )
        return supertest(app)
          .delete(`/api/mashes/${idToRemove}`)
          .set('Authorization', makeAuthHeader(testUser))
          .expect(204)
          .then((res) =>
            supertest(app).get(`/api/mashes`).expect(expectedMashes)
          )
      })
    })
  })
})
