/* eslint-disable semi */
const BindsService = {
  getAllBinds(knex) {
    return knex.select('*').from('bind')
  },
  getBindsByMash(knex, mash_id) {
    return knex.select('*').from('bind').where('mash_id', mash_id)
  },
  insertBind(knex, newBind) {
    return knex.insert(newBind).into('bind').returning('*')
  },
  getById(knex, id) {
    return knex.from('bind').select('*').where('id', id).first()
  },
  deleteBind(knex, id) {
    return knex('bind').where({ id }).delete()
  },
}

module.exports = BindsService
