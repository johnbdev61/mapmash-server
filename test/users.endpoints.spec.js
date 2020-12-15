/* eslint-disable semi */
const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeUsersArray, makeMaliciousUser } = require('./users.fixtures')
const { truncateAllTables } = require('./test-helpers')

describe.only('Users Endponts', () => {
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

  describe('GET /api/users', () => {
    context('Given no users', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app).get('/api/users').expect(200, [])
      })
    })

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray()

      beforeEach('insert users', () => {
        return db.into('users').insert(testUsers)
      })

      it('responds with 200 and all of the users', () => {
        return supertest(app).get('/api/users').expect(200, testUsers)
      })
    })

    context(`Given an XSS attack user`, () => {
      const { maliciousUser, expectedUser } = makeMaliciousUser()

      beforeEach('insert malicious user', () => {
        return db.into('users').insert([maliciousUser])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get('/api/users')
          .expect(200)
          .expect((res) => {
            expect(res.body[0].username).to.eql(expectedUser.username)
            expect(res.body[0].password).to.eql(expectedUser.password)
          })
      })
    })
  })

  describe('GET /api/users/:user_id', () => {
    context('Given no users', () => {
      it('responds with 404', () => {
        const userId = 123456
        return supertest(app)
          .get(`/api/users/${userId}`)
          .expect(404, { error: { message: `User doesn't exist` } })
      })
    })

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray()

      beforeEach('insert users', () => {
        return db.into('users').insert(testUsers)
      })

      it('responds with 200 and the specified user', () => {
        const userId = 2
        const expectedUser = testUsers[userId - 1]
        return supertest(app)
          .get(`/api/users/${userId}`)
          .expect(200, expectedUser)
      })
    })

    context('Given an XSS attack user', () => {
      const { maliciousUser, expectedUser } = makeMaliciousUser()

      beforeEach('insert malicious user', () => {
        return db.into('users').insert([maliciousUser])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/users/${maliciousUser.id}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.username).to.eql(expectedUser.username)
            expect(res.body.password).to.eql(expectedUser.password)
          })
      })
    })
  })

  describe(`POST /api/users`, () => {
    context('When posting a user with required field', () => {
      it('creates a user, responding with 201 and new user', () => {
        const newUser = {
          username: 'Sonic',
          password: 'the Hedgehog',
        }
        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(201)
          .expect((res) => {
            expect(res.body.username).to.eql(newUser.username)
            expect(res.body.password).to.eql(newUser.password)
            expect(res.body).to.have.property('id')
            expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
          })
          .then((res) => {
            supertest(app).get(`/api/users/${res.body.id}`).expect(res.body)
          })
      })
    })
    context('When posting a user without required field', () => {
      const requiredFields = ['username', 'password']

      requiredFields.forEach((field) => {
        const newUser = {
          username: 'test user',
          password: 'secret',
        }
        it(`responds with 400 and an error message '${field}' is missing`, () => {
          delete newUser[field]

          return supertest(app)
            .post('/api/users')
            .send(newUser)
            .expect(400, {
              error: { message: `Missing '${field}' in request body` },
            })
        })
      })
    })
  })

  describe('DELETE /api/users', () => {
    context('Given user does not exist', () => {
      it('responds with 404', () => {
        const userId = 123456
        return supertest(app)
          .delete(`/api/users/${userId}`)
          .expect(404, { error: { message: `User doesn't exist` } })
      })
    })

    context('Given there is a user in the database matching id', () => {
      const testUsers = makeUsersArray()

      beforeEach('insert users', () => {
        return db.into('users').insert(testUsers)
      })

      it('responds with 204 and removes the user', () => {
        const idToRemove = 2
        const expectedUser = testUsers.filter((user) => user.id !== idToRemove)
        return supertest(app)
          .delete(`/api/users/${idToRemove}`)
          .expect(204)
          .then((res) => {
            supertest(app).get(`/api/users`).expect(expectedUser)
          })
      })
    })
  })

  describe('PATCH /api/users/:user_id', () => {
    context('Given no users', () => {
      it('responds with 404', () => {
        const userId = 123456
        return supertest(app)
          .delete(`/api/users/${userId}`)
          .expect(404, { error: { message: `User doesn't exist` } })
      })
    })

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray()

      beforeEach('insert users', () => {
        return db.into('users').insert(testUsers)
      })

      it('responds with 204 and updates the user', () => {
        const idToUpdate = 2
        const updateUser = {
          username: 'updated username',
          password: 'updated password',
        }
        const expectedUser = {
          ...testUsers[idToUpdate - 1],
          ...updateUser,
        }
        return supertest(app)
          .patch(`/api/users/${idToUpdate}`)
          .send(updateUser)
          .expect(204)
          .then((res) => {
            supertest(app).get(`/api/users/${idToUpdate}`).expect(expectedUser)
          })
      })
    })
  })
})
