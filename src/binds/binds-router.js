/* eslint-disable semi */
const express = require('express')
const BindsService = require('./binds-service')
const xss = require('xss')

const bindsRouter = express.Router()
const jsonParser = express.json()

bindsRouter
  .route('/')
  .get((req, res, next) => {
    BindsService.getAllBinds(req.app.get('db'))
      .then((binds) => {
        if (binds.length !== 0) {
          binds = binds.map((bind) => {
            return {
              id: bind.id,
              mash_id: bind.mash_id,
              key_input: bind.key_input,
              key_action: xss(bind.key_action), // sanitize content
            }
          })
        }
        return binds
      })
      .then((binds) => res.json(binds))
      .catch(next)
  })
  .post((req, res, next) => {
    const bindArr = [...req.body]
    for (const value of bindArr) {
      if (value.key_action === '') {
        value.key_action = 'Not Used'
      } else {
        value.key_action = xss(value.key_action)
      }
    }
    console.log('BIND ARRAY', bindArr)
    const insertBindPromises = []
    for (const bind of bindArr) {
      //TODO: Promise All
      insertBindPromises.push(BindsService.insertBind(req.app.get('db'), bind))
    }
    Promise.all(insertBindPromises)
      .then((binds) => {
        console.log('RESULTS', binds)
        res.status(201).json(binds)
      })
      .catch(next)
  })

bindsRouter
  .route('/:bind_id')
  .all((req, res, next) => {
    BindsService.getById(req.app.get('db'), req.params.bind_id)
      .then((bind) => {
        if (!bind) {
          return res.status(404).json({
            error: { message: `Bind does not exist` },
          })
        }
        res.bind = bind //save the mash for next middleware
        next() //call next so next middleware executes
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json({
      id: res.bind.id,
      mash_id: res.bind.mash_id,
      key_input: res.bind.key_input,
      key_action: xss(res.bind.key_action),
    })
  })
  .delete((req, res, next) => {
    BindsService.deleteBind(req.app.get('db'), req.params.bind_id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = bindsRouter
