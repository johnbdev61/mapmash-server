/* eslint-disable semi */
const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeBindsArray, makeMaliciousBind } = require('./binds.fixtures')
const { makeMashesArray } = require('./mashes.fixtures')
const { makeUsersArray } = require('./users.fixtures')
const { truncateAllTables } = require('./test-helpers')
const { getBindsByMash, getAllBinds } = require('../src/binds/binds-service')

describe.only('Binds Endpoints', () => {
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

  describe('GET /api/binds', () => {
    context(`Given no binds`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get('/api/binds').expect(200, [])
      })
    })

    context('Given there are binds in the database', () => {
      const testUsers = makeUsersArray()
      const testMashes = makeMashesArray()
      const testBinds = makeBindsArray()

      beforeEach('insert binds', () => {
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

      it('responds with 200 and all of the binds', () => {
        return supertest(app).get('/api/binds').expect(200, testBinds)
      })
    })

    context(`Given an XSS attack bind`, () => {
      const testUsers = makeUsersArray()
      const { maliciousBind, expectedBind } = makeMaliciousBind()

      beforeEach('insert malicious bind', () => {
        return db
          .into('users')
          .insert(testUsers)
          .then(() => {
            return db.into('bind').insert([maliciousBind])
          })
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get('/api/binds')
          .expect(200)
          .expect((res) => {
            expect(res.body[0].key_action).to.eql(expectedBind.key_action)
          })
      })
    })
  })

  describe(`GET /api/binds/:bind_id`, () => {
    context(`Given no binds`, () => {
      it(`responds with 404`, () => {
        const bindId = 123456
        return supertest(app)
          .get(`/api/binds/${bindId}`)
          .expect(404, { error: { message: `Bind does not exist` } })
      })
    })

    context('Given there are binds in the database', () => {
      const testUsers = makeUsersArray()
      const testMashes = makeMashesArray()
      const testBinds = makeBindsArray()

      beforeEach('insert binds', () => {
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

      it('responds with 200 and the specified bind', () => {
        const bindId = 2
        const expectedBind = testBinds[bindId - 1]
        return supertest(app)
          .get(`/api/binds/${bindId}`)
          .expect(200, expectedBind)
      })
    })
    context(`Given an XSS attack bind`, () => {
      const testUsers = makeUsersArray()
      const { maliciousBind, expectedBind } = makeMaliciousBind()

      beforeEach('insert malicious bind', () => {
        return db
          .into('users')
          .insert(testUsers)
          .then(() => {
            return db.into('bind').insert([maliciousBind])
          })
      })
      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/binds/${maliciousBind.id}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.key_action).to.eql(expectedBind.key_action)
          })
      })
    })
  })

  describe(`POST /api/binds`, () => {
    context('When posting a bind with required field', () => {
      it('creates a bind, responding with 201 and new bind', () => {
        const newBind = {
          key_action: 'A Button',
          key_input: 'Jump',
        }
        return supertest(app)
          .post('/api/binds')
          .send(newBind)
          .expect(201)
          .expect((res) => {
            expect(res.body.key_input).to.eql(newBind.key_input)
            expect(res.body.key_action).to.eql(newBind.key_action)
            expect(res.body).to.have.property('id')
            expect(res.headers.location).to.eql(`/api/binds/${res.body.id}`)
          })
          .then((res) => {
            supertest(app).get(`/api/binds/${res.body.id}`).expect(res.body)
          })
      })
    })
  })

  describe('DELETE /api/binds', () => {
    context('Given bind does not exist', () => {
      it('responds with 404', () => {
        const bindId = 123456
        return supertest(app)
          .delete(`/api/binds/${bindId}`)
          .expect(404, { error: { message: 'Bind does not exist' } })
      })
    })

    context('Given there is a bind in the database matching id', () => {
      const testUsers = makeUsersArray()
      const testMashes = makeMashesArray()
      const testBinds = makeBindsArray()

      beforeEach('insert binds', () => {
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

      it('responds with 204 and removes the bind', () => {
        const idToRemove = 2
        const expectedBinds = testBinds.filter((bind) => bind.id !== idToRemove)
        return supertest(app)
          .delete(`/api/binds/${idToRemove}`)
          .expect(204)
          .then((res) => supertest(app).get(`/api/binds`).expect(expectedBinds))
      })
    })
  })

  describe('PATCH /api/binds/:bind_id', () => {
    context('Given no binds', () => {
      it('responds with 404', () => {
        const bindId = 123456
        return supertest(app)
          .delete(`/api/binds/${bindId}`)
          .expect(404, { error: { message: 'Bind does not exist' } })
      })
    })

    context('Given there are binds in the database', () => {
      const testUsers = makeUsersArray()
      const testMashes = makeMashesArray()
      const testBinds = makeBindsArray()

      beforeEach('insert binds', () => {
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

      it('responds with 204 and updates the bind', () => {
        const idToUpdate = 2
        const updateBind = {
          key_input: 'updated button',
          key_action: 'updated action',
        }
        const expectedBind = {
          ...testBinds[idToUpdate - 1],
          ...updateBind,
        }
        return supertest(app)
          .patch(`/api/binds/${idToUpdate}`)
          .send(updateBind)
          .expect(204)
          .then((res) =>
            supertest(app).get(`/api/binds/${idToUpdate}`).expect(expectedBind)
          )
      })

      it('responds with 204 when updating only a subset of fields', () => {
        const idToUpdate = 2
        const updateBind = {
          key_action: 'updated action',
        }
        const expectedBind = {
          ...testBinds[idToUpdate - 1],
          ...updateBind,
        }
        return supertest(app)
          .patch(`/api/binds/${idToUpdate}`)
          .send({
            ...updateBind,
            fieldToIgnore: 'should not be in GET response',
          })
          .expect(204)
          .then((res) =>
            supertest(app).get(`/api/binds/${idToUpdate}`).expect(expectedBind)
          )
      })
    })
  })
})
