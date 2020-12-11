/* eslint-disable semi */
const express = require('express')
const MashesService = require('./mashes-service')
const xss = require('xss')

const mashesRouter = express.Router()
const jsonParser = express.json()

mashesRouter
  .route('/')
  .get((req, res, next) => {
    MashesService.getAllMashes(req.app.get('db'))
      .then((mashes) => {
        if (mashes.length !== 0) {
          mashes = mashes.map((mash) => {
            return {
              id: mash.id,
              game_title: xss(mash.game_title), //sanitize content
              notes: xss(mash.notes), // sanitize content
              date_modified: mash.date_modified,
            }
          })
        }
        return mashes
      })
      .then((mashes) => res.json(mashes))
      .catch(next)
  })
  .post((req, res, next) => {
    const { game_title, notes } = req.body
    let newMash = {
      game_title,
      notes,
    }

    for (const [key, value] of Object.entries(newMash)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing ${key} in request body` },
        })
      }
    }

    newMash = {
      game_title: xss(game_title),
      notes: xss(notes),
    }

    MashesService.insertMash(req.app.get('db'), newMash)
      .then((mash) => {
        res.status(201).location(`/${mash.id}`).json(mash)
      })
      .catch(next)
  })

mashesRouter
  .route('/:mash_id')
  .all((req, res, next) => {
    MashesService.getById(
      req.app.get('db'),
      req.params.mash_id // JOHN: double check this for error
    )
      .then((mash) => {
        if (!mash) {
          return res.status(404).json({
            error: { message: `Mash does not exist` },
          })
        }
        res.mash = mash //save the mash for next middleware
        next() //call next so next middleware executes
      })
      .catch(next)
  })
  .get((req, res, next) => {
    MashesService.getBindsByMash(req.app.get('db'), req.params.mash_id).then(
      (binds) => {
        res
          .json({
            id: res.mash.id,
            game_title: xss(res.mash.game_title), // sanitize title
            notes: xss(res.mash.notes), // sanitize content
            binds,
            date_modified: res.mash.date_modified,
          })
          .catch(next)
      }
    )
  })
  .delete((req, res, next) => {
    MashesService.deleteMash(req.app.get('db'), req.params.article_id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { game_title, notes } = req.body
    const mashToUpdate = { game_title, notes }
    const numberOfValues = Object.values(mashToUpdate).filter(Boolean).length

    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'game_title' or 'notes'`,
        },
      })
    }

    MashesService.updateMash(
      req.app.get('db'),
      req.params.mash_id, // JOHN: DOUBLE CHECK FOR ERROR
      mashToUpdate
    )
      .then((numRowsAffected) => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = mashesRouter
