'use strict'

const Symbol = require('es-symbol')

const FEATHERS_ACTION = Symbol('FEATHERS_ACTION')

const DEFAULT_KEY = 'id'
const DEFAULT_METHODS = ['find', 'get', 'create', 'update', 'patch', 'remove']

const SECTIONS = ['call', 'start', 'success', 'error']

module.exports = {
  FEATHERS_ACTION,
  DEFAULT_KEY,
  DEFAULT_METHODS,
  SECTIONS
}
