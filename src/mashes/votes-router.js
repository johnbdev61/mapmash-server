/* eslint-disable semi */
const express = require('express')
const { requireAuth } = require('../middleware/jwt-auth')
const VotesService = require('./votes-service')

const votesRouter = express.Router()
const jsonParser = express.json()

votesRouter.route('/').post(jsonParser, requireAuth, (req, res, next) => {
  const { is_upvote, mashes_id, users_id } = req.body
  let newVote = {
    is_upvote,
    mashes_id,
    users_id,
  }
  VotesService.insertVote(req.app.get('db'), newVote)
    .then(() => {
      return res.status(201).location(`/api/votes`)
    })
    .catch(next)
})

module.exports = votesRouter
