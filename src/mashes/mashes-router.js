/* eslint-disable semi */
const express = require('express')
const MashesService = require('./mashes-service')
const xss = require('xss')
const { requireAuth } = require('../middleware/jwt-auth')
const VotesService = require('./votes-service')

const mashesRouter = express.Router()
const jsonParser = express.json()

mashesRouter
  .route('/')
  .get(requireAuth, async (req, res, next) => {
    async function getVotes(knex, mashes) {
      const arr = []
      for (let i = 0; i < mashes.length; i++) {
        const vote = await VotesService.getVotesByMash(knex, mashes[i].id)
        arr.push(vote)
      }
      return arr
    }
    MashesService.getAllMashes(req.app.get('db'))
      .then(async (mashes) => {
        if (mashes.length !== 0) {
          const votes = await getVotes(req.app.get('db'), mashes)
          return mashes.map((mash, i) => ({
            id: mash.id,
            game_title: xss(mash.game_title), //sanitize content
            notes: xss(mash.notes), // sanitize content
            date_modified: mash.date_modified,
            votes: votes[i],
            author_id: mash.author_id,
          }))
        }
      })
      .then((mashes) => {
        return res.json(mashes || [])
      })
      .catch(next)
  })
  .post(jsonParser, requireAuth, (req, res, next) => {
    const { game_title, notes } = req.body
    let newMash = {
      game_title,
      notes,
      author_id: req.user.id,
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
      author_id: req.user.id,
    }

    MashesService.insertMash(req.app.get('db'), newMash)
      .then((mashes) => {
        const mash = mashes[0]
        res.status(201).location(`/api/mashes/${mash.id}`).json(mash)
      })
      .catch(next)
  })

mashesRouter
  .route('/:mash_id')
  .all((req, res, next) => {
    console.log('buuutttttcheeeeks')
    MashesService.getById(req.app.get('db'), req.params.mash_id)
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
            author_id: res.mash.author_id,
          })
          .catch(next)
      }
    )
  })

  .delete(jsonParser, requireAuth, (req, res, next) => {
    MashesService.deleteMash(req.app.get('db'), req.params.mash_id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, requireAuth, (req, res, next) => {
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
      req.params.mash_id,
      mashToUpdate
    )
      .then((numRowsAffected) => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = mashesRouter
