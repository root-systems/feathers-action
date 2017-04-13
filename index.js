'use strict'

const { isArray } = Array
const is = require('typeof-is')
const pipe = require('ramda/src/pipe')
const indexBy = require('ramda/src/indexBy')
const map = require('ramda/src/map')

const createActions = require('./actions')

module.exports = createModule

function createModule (options = {}) {
  if (is.string(options)) {
    options = { service: options }
  }

  if (isArray(options)) {
    return createModules(options)
  }

  return {
    actions: createActions(options)
  }
}

const createModules = pipe(
  map(createModule),
  indexBy
)
