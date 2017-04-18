'use strict'

const merge = require('ramda/src/merge')
const assoc = require('ramda/src/assoc')
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
      return assoc(id, data)
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
      // TODO clean this up with ramda
      return state => {
        return assoc(
          cid,
          merge(state[cid], { result, error }),
          state
        )
      }
    },
    [actionTypes.error]: action => {
      const { cid } = action.meta
      const result = null
      const error = action.payload
      // TODO clean this up with ramda
      return state => {
        return assoc(
          cid,
          merge(state[cid], { result, error }),
          state
        )
      }
    }
  }

  return decorate(
    withDefaultState({}),
    updateStateAt('feathersAction'),
    withDefaultState({}),
    handleActions(requestUpdateHandlers)
  )
}
