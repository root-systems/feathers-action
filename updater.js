'use strict'

const assoc = require('ramda/src/assoc')
const assocPath = require('ramda/src/assocPath')
const dissoc = require('ramda/src/dissoc')
const pipe = require('ramda/src/pipe')
const reduce = require('ramda/src/reduce')
const __ = require('ramda/src/__')
const { withDefaultState, concat, updateStateAt, handleActions, decorate } = require('redux-fp')
const merge = require('ramda/src/merge')

const createActionTypes = require('./action-types')

module.exports = createUpdater

function createUpdater (options) {
  const { service } = options

  const actionTypes = createActionTypes(merge(options, { internal: true }))

  return concat(
    createServiceUpdater(actionTypes, service),
    createRequestUpdater(actionTypes)
  )
}

function createServiceUpdater (actionTypes, service) {
  const serviceUpdateHandlers = {
    [actionTypes.set]: (action) => {
      const { id, data } = action.payload
      return assoc(id, data)
    },
    [actionTypes.setAll]: (action) => {
      return reduce((sofar, next) => {
        return assoc(next.id, next, sofar)
      }, __, action.payload)
    },
    [actionTypes.unset]: (action) => {
      const { id } = action.payload
      return dissoc(id)
    },
    [actionTypes.unsetAll]: (action) => {
      return reduce((sofar, next) => {
        return dissoc(next, sofar)
      }, __, action.payload)
    }
  }

  return decorate(
    withDefaultState({}),
    updateStateAt(service),
    withDefaultState({}),
    handleActions(serviceUpdateHandlers)
  )
}

function createRequestUpdater (actionTypes) {
  const requestUpdateHandlers = {
    [actionTypes.start]: action => {
      const { cid } = action.meta
      return assoc(cid, action.payload)
    },
    [actionTypes.complete]: action => {
      const { cid } = action.meta
      const result = action.payload
      const error = null
      return handleComplete({ cid, result, error })
    },
    [actionTypes.error]: action => {
      const { cid } = action.meta
      const result = null
      const error = action.payload
      return handleComplete({ cid, result, error })
    }
  }

  function handleComplete ({ cid, result, error }) {
    return pipe(
      assocPath([cid, 'result'], result),
      assocPath([cid, 'error'], error)
    )
  }

  return decorate(
    withDefaultState({}),
    updateStateAt('feathers'),
    withDefaultState({}),
    handleActions(requestUpdateHandlers)
  )
}
