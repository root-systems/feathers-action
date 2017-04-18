'use strict'

const { isArray } = Array
const is = require('typeof-is')
const pipe = require('ramda/src/pipe')
const indexBy = require('ramda/src/indexBy')
const prop = require('ramda/src/prop')
const map = require('ramda/src/map')

const createActions = require('./actions')
const createUpdater = require('./updater')

module.exports = {
  createService: createServiceModule,
  createRequest: createRequestModule
}

function createServiceModule (options = {}) {
  if (is.string(options)) {
    options = { service: options }
  }

  if (isArray(options)) {
    return createServiceModules(options)
  }

  const { service } = options

  return {
    service,
    actions: createActions(options),
    updater: createUpdater.service(options)
  }
}

const createServiceModules = pipe(
  map(createServiceModule),
  indexBy(prop('service'))
)

function createRequestModule () {
  return {
    updater: createUpdater.request()
  }
}
