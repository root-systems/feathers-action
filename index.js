'use strict'

const { isArray } = Array
const is = require('typeof-is')
const pipe = require('ramda/src/pipe')
const indexBy = require('ramda/src/indexBy')
const prop = require('ramda/src/prop')
const map = require('ramda/src/map')

const createActions = require('./actions')
const createUpdater = require('./updater')
const createEpic = require('./epic')

module.exports = createModule

function createModule (options = {}) {
  if (is.string(options)) {
    options = { service: options }
  }

  if (isArray(options)) {
    return createModules(options)
  }

  const { service } = options

  return {
    name: service,
    actions: createActions(options),
    updater: createUpdater(options),
    epic: createEpic(options)
  }
}

const createModules = pipe(
  map(createModule),
  indexBy(prop('name'))
)
