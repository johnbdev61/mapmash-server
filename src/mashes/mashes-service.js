/* eslint-disable semi */
const MashesService = {
  getAllMashes(knex) {
    return knex
      .select('mashes.*', 'users.username')
      .from('mashes')
      .leftOuterJoin('users', 'mashes.author_id', '=', 'users.id')
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
  getByUserId(knex, authorId) {
    return knex.from('mashes').select('*').where({ author_id: authorId })
  },
  deleteMash(knex, id) {
    return knex('mashes').where({ id }).delete()
  },
}

module.exports = MashesService
