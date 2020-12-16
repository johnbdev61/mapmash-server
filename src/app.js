/* eslint-disable semi */
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const mashesRouter = require('./mashes/mashes-router')
const usersRouter = require('./users/users-router')
const bindsRouter = require('./binds/binds-router')
const authRouter = require('./auth/auth-router')
const VotesService = require('./mashes/votes-service')

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common'

const app = express()
app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/mashes', mashesRouter)
app.use('/api/users', usersRouter)
app.use('/api/binds', bindsRouter)

app.get('/', (req, res) => {
  VotesService.getVotesByMash(req.app.get('db'), 1)
  res.send('Welcome to the Map Mash API!')
})

app.use(function errorHandler(error, req, res, next) {
  let response
  response = { error: { message: 'server error' } }
  console.error(error)
  res.status(500).json(response)
})

module.exports = app
