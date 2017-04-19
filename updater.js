'use strict'

const assoc = require('ramda/src/assoc')
const assocPath = require('ramda/src/assocPath')
const dissoc = require('ramda/src/dissoc')
const pipe = require('ramda/src/pipe')
const { withDefaultState, concat, updateStateAt, handleActions, decorate } = require('redux-fp')

const createActionTypes = require('./action-types')

module.exports = createUpdater

function createUpdater (options) {
  const { service } = options

  const actionTypes = createActionTypes(options)

  return concat(
    createServiceUpdater(actionTypes, service),
    createRequestUpdater(actionTypes)
  )
}

function createServiceUpdater (actionTypes, service) {
  const serviceUpdateHandlers = {
    [actionTypes.set]: (action) => {
      const { id, data } = action.payload
      return value => {
        if (value === undefined) return dissoc(id, path)
        return assoc(id, data, value)
      }
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
    [actionTypes.requestStart]: action => {
      const { cid } = action.meta
      return assoc(cid, action.payload)
    },
    [actionTypes.requestSuccess]: action => {
      const { cid } = action.meta
      const result = action.payload
      const error = null
      return handleComplete({ cid, result, error })
    },
    [actionTypes.requestError]: action => {
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
    updateStateAt('feathersAction'),
    withDefaultState({}),
    handleActions(requestUpdateHandlers)
  )
}
