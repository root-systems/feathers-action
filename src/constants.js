'use strict'

const Symbol = require('es-symbol')

const DEFAULT_KEY = 'id'
const FEATHERS_ACTION = Symbol('FEATHERS_ACTION')
const METHODS = ['find', 'get', 'create', 'update', 'patch', 'remove']
const METHODS = ['start', 'success', 'error']

module.exports = {
  DEFAULT_KEY,
  FEATHERS_ACTION,
  METHODS,
  SECTIONS
}
