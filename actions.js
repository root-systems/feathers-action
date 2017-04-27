'use strict'

const createAction = require('@f/create-action')
const pipe = require('ramda/src/pipe')
const mapObjIndexed = require('ramda/src/mapObjIndexed')
const merge = require('ramda/src/merge')
const invertObj = require('ramda/src/invertObj')

const createActionTypes = require('./action-types')

module.exports = createActionCreators

function createActionCreators (options) {
  const actionTypes = createActionTypes(options)

  const getActionCreatorsForTypes = mapObjIndexed((_, type) => {
    return ActionCreator(type)
  })

  return getActionCreatorsForTypes(actionTypes)

  function ActionCreator (type) {
    const argsCreator = argsCreatorByType[type]
    const payloadCreator = (cid, ...args) => argsCreator(...args)
    const actionCreator = createAction(actionTypes[type], payloadCreator, metaCreator)
    // HACK because @f/create-action doesn't do this already
    if (type === 'error') {
      return (...args) => {
        var action = actionCreator(...args)
        action.error = true
        return action
      }
    }
    return actionCreator
  }
}

const argsCreatorByType = {
  find: (params = {}) => ({ params }),
  get: (id, params = {}) => ({ id, params }),
  create: (data, params = {}) => ({ data, params }),
  update: (id, data, params = {}) => ({ id, data, params }),
  patch: (id, data, params = {}) => ({ id, data, params }),
  remove: (id, params = {}) => ({ id, params }),

  set: (id, data) => ({ id, data }),
  unset: (id, data) => ({ id, data }),
  setAll: (data) => data,
  unsetAll: (data) => data,

  start: (request) => request,
  complete: (result) => result,
  error: (err) => err
}

function payloadCreator (type) {
  const argsCreator = argsCreatorByMethod[type]
  return (cid, ...args) => argsCreator(...args)
}

function metaCreator (cid) {
  return { cid }
}
