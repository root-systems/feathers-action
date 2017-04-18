'use strict'

const pipe = require('ramda/src/pipe')
const merge = require('ramda/src/merge')
const invertObj = require('ramda/src/invertObj')
const prepend = require('ramda/src/prepend')
const toUpper = require('ramda/src/toUpper')
const map = require('ramda/src/map')
const join = require('ramda/src/join')

const { FEATHERS_ACTION, DEFAULT_METHODS } = require('./constants')

module.exports = createActionTypes

function createActionTypes (options) {
  const {
    service,
    methods = DEFAULT_METHODS
  } = options

  return merge(
    getActionTypesForMethods(methods),
    {
      set: createActionType([service, 'set']),
      requestStart: createActionType(['request', 'start']),
      requestComplete: createActionType(['request', 'complete']),
      requestError: createActionType(['request', 'error'])
    }
  )
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
