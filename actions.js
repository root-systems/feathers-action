'use strict'

const merge = require('ramda/src/merge')
const reduce = require('ramda/src/reduce')

const { FEATHERS_ACTION, DEFAULT_METHODS } = require('./constants')

module.exports = createActionCreators

function createActionCreators (options) {
  const {
    service,
    methods = DEFAULT_METHODS
  } = options

  const getActionCreatorsForMethods = reduce((sofar, nextMethod) => {
    return merge(sofar, {
      [nextMethod]: Action(nextMethod, argsCreatorByMethod[nextMethod])
    })
  }, {})
  
  return merge(
    getActionCreatorsForMethods(methods),
    {
      // special
      set,
      requestStart,
      requestComplete,
      requestError
    }
  )

  function set () {}
  function requestStart () {}
  function requestComplete () {}
  function requestError () {}

  function Action (method, argsCreator) {
    return (...args) => ({
      type: FEATHERS_ACTION,
      payload: {
        service,
        method,
        args: argsCreator(...args)
      }
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

