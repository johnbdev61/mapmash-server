/* eslint-disable semi */
const MashesService = {
  getAllMashes(knex) {
    return knex.select('*').from('mashes')
  },
  getBindsByMash(knex, mash_id) {
    return knex.select('*').from('bind').where('mash_id', mash_id)
  },
  getVotesByMash(knex, mash_id) {
    return knex.select('*').from('votes').where('mash_id', mash_id)
  },
  insertMash(knex, newMash) {
    return knex.insert(newMash).into('mashes').returning('*')
  },
  getById(knex, id) {
    return knex.from('mashes').select('*').where('id', id).first()
  },
  deleteMash(knex, id) {
    return knex('mashes').where({ id }).delete()
  },
  updateMash(knex, id, newMashFields) {
    return knex('mashes').where({ id }).update(newMashFields)
  },
}

module.exports = MashesService
