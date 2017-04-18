'use strict'

const pipe = require('ramda/src/pipe')
const mapObjIndexed = require('ramda/src/mapObjIndexed')
const merge = require('ramda/src/merge')
const invertObj = require('ramda/src/invertObj')

const { FEATHERS, DEFAULT_METHODS } = require('./constants')

const createActionTypes = require('./action-types')

module.exports = createActionCreators

function createActionCreators (options) {
  const {
    service,
    methods = DEFAULT_METHODS
  } = options

  const actionTypes = createActionTypes(options)

  const getActionCreatorsForMethods = pipe(
    invertObj,
    mapObjIndexed((_, method) => Action(method, argsCreatorByMethod[method]))
  )

  return merge(
    getActionCreatorsForMethods(methods),
    {
      // special
      set,
      requestStart,
      requestSuccess,
      requestError
    }
  )

  function set (id, data) {
    return {
      type: actionTypes.set,
      payload: { id, data }
    }
  }

  function requestStart (cid, call) {
    return {
      type: actionTypes.requestStart,
      payload: call,
      meta: { cid }
    }
  }
  function requestSuccess (cid, result) {
    return {
      type: actionTypes.requestSuccess,
      payload: result,
      meta: { cid }
    }
  }
  function requestError (cid, err) {
    return {
      type: actionTypes.requestError,
      payload: err,
      error: true,
      meta: { cid }
    }
  }

  function Action (method, argsCreator) {
    return (...args) => ({
      type: actionTypes[method],
      payload: argsCreator(...args)
    })
  }
}

const argsCreatorByMethod = {
  find: (params = {}) => ({ params }),
  get: (id, params = {}) => ({ id, params }),
  create: (data, params = {}) => ({ data, params }),
  update: (id, data, params = {}) => ({ id, data, params }),
  patch: (id, data, params = {}) => ({ id, data, params }),
  remove: (id, params = {}) => ({ id, params })
}
