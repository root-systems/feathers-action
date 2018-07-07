'use strict'

const createAction = require('@f/create-action')
const mapObjIndexed = require('ramda/src/mapObjIndexed')

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
  ready: () => null,
  complete: (result) => result,
  error: (err) => err
}

// function payloadCreator (type) {
//   const argsCreator = argsCreatorByMethod[type]
//   return (cid, ...args) => argsCreator(...args)
// }

function metaCreator (cid) {
  return { cid }
}
