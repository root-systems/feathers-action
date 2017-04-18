'use strict'

const pipe = require('ramda/src/pipe')
const merge = require('ramda/src/merge')
const invertObj = require('ramda/src/invertObj')
const prepend = require('ramda/src/prepend')
const toUpper = require('ramda/src/toUpper')
const map = require('ramda/src/map')
const join = require('ramda/src/join')

const { FEATHERS_ACTION, DEFAULT_METHODS } = require('./constants')

module.exports = {
  service: createServiceActionTypes,
  request: createRequestActionTypes
}

function createServiceActionTypes (options) {
  const {
    service,
    methods = DEFAULT_METHODS
  } = options

  return merge(
    getActionTypesForMethods(methods),
    { set: createActionType([service, 'set']) }
  )
}

function createRequestActionTypes () {
  return {
    start: createActionType(['request', 'start']),
    complete: createActionType(['request', 'complete']),
    error: createActionType(['request', 'error'])
  }
}

const createActionType = pipe(
  prepend('feathers'),
  map(toUpper),
  join('_')
)

const getActionTypesForMethods = pipe(
  invertObj,
  map(next => FEATHERS_ACTION)
)
