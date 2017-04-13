'use strict'

const Symbol = require('es-symbol')

const FEATHERS_ACTION = Symbol('FEATHERS_ACTION')

const DEFAULT_ID_FIELD = 'id'
const DEFAULT_METHODS = ['find', 'get', 'create', 'update', 'patch', 'remove']


module.exports = {
  FEATHERS_ACTION,
  DEFAULT_ID_FIELD,
  DEFAULT_METHODS,
}
