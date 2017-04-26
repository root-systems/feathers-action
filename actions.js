'use strict'

const pipe = require('ramda/src/pipe')
const mapObjIndexed = require('ramda/src/mapObjIndexed')
const merge = require('ramda/src/merge')
const invertObj = require('ramda/src/invertObj')

const { DEFAULT_METHODS } = require('./constants')

const createActionTypes = require('./action-types')

module.exports = createActionCreators

function createActionCreators (options) {
  const {
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
      start,
      complete,
      error
    }
  )

  function set (cid, id, data) {
    return {
      type: actionTypes.set,
      payload: { id, data },
      meta: { cid }
    }
  }

  function start (cid, call) {
    return {
      type: actionTypes.start,
      payload: call,
      meta: { cid }
    }
  }
  function complete (cid, result) {
    return {
      type: actionTypes.complete,
      payload: result,
      meta: { cid }
    }
  }
  function error (cid, err) {
    return {
      type: actionTypes.error,
      payload: err,
      error: true,
      meta: { cid }
    }
  }

  function Action (method, argsCreator) {
    return (cid, ...args) => ({
      type: actionTypes[method],
      payload: argsCreator(...args),
      meta: { cid }
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
