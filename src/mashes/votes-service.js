/* eslint-disable semi */
const xss = require('xss')
const VotesService = {
  getAllVotes(knex) {
    return knex.select('*').from('votes')
  },

  async getVotesByMash(knex, mashes_id) {
    let counter = 0
    await knex
      .select('*')
      .from('votes')
      .where('mashes_id', mashes_id)
      .then((votes) => {
        for (let i = 0; i < votes.length; i++) {
          if (votes[i]) {
            counter++
          }
        }
      })
    return counter
  },

  insertVote(knex, newVote) {
    return knex.insert(newVote).into('votes').returning('*')
  },

  getById(knex, id) {
    return knex.from('votes').select('*').where('id', id).first()
  },

  updateVote(knex, id, newVote) {
    return knex('vote').where({ id }).update(newVote)
  },
}

module.exports = VotesService
