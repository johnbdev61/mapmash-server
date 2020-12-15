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
    const { key_input, key_action } = req.body
    let newBind = {
      key_input,
      key_action,
    }

    for (const [key, value] of Object.entries(newBind)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing ${key} in request body` },
        })
      }
    }

    newBind = {
      key_input: key_input,
      key_action: xss(key_action),
    }

    BindsService.insertBind(req.app.get('db'), newBind)
      .then((binds) => {
        const bind = binds[0]
        res.status(201).location(`/api/binds/${bind.id}`).json(bind)
      })
      .catch(next)
  })

bindsRouter
  .route('/:bind_id')
  .all((req, res, next) => {
    BindsService.getById(
      req.app.get('db'),
      req.params.bind_id // JOHN: double check this for error
    )
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
  .patch(jsonParser, (req, res, next) => {
    const { key_input, key_action } = req.body
    const bindToUpdate = { key_input, key_action }
    const numberOfValues = Object.values(bindToUpdate).filter(Boolean).length

    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'key_input' or 'key_action'`,
        },
      })
    }

    BindsService.updateBind(
      req.app.get('db'),
      req.params.bind_id, // JOHN: DOUBLE CHECK FOR ERROR
      bindToUpdate
    )
      .then((numRowsAffected) => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = bindsRouter
