'use strict'

const Tc = require('tcomb')
const createCid = require('cuid')
const assign = require('lodash/assign')

const createActionCreators = require('./actions')
const constants = require('./constants')
const types = require('./types')

const FEATHERS_ACTION = constants.FEATHERS_ACTION

const callArgs = {
  find: (params) => ({ params }),
  get: (id, params) => ({ id, params }),
  create: (data, params) => ({ data, params }),
  update: (id, data, params) => ({ id, data, params }),
  patch: (id, data, params) => ({ id, data, params }),
  remove: (id, params) => ({ id, params }),
}

const Options = Tc.struct({
  client: Tc.Function
})

const Middleware = Tc.Function

module.exports = Tc.func(
  Options, Middleware, 'createMiddleware'
).of(createMiddleware)

// https://github.com/agraboso/redux-api-middleware/blob/master/src/middleware.js
// http://redux.js.org/docs/advanced/Middleware.html

function createMiddleware (options) {
  const client = options.client

  return (store) => (next) => (action) => {
    if (action.type !== FEATHERS_ACTION) {
      return next(action)
    }

    const payload = action.payload

    const serviceName = payload.service
    const method = payload.method
    const args = payload.args
    const createStart = payload.start
    const createSuccess = payload.success
    const createError = payload.error

    const service = client.service(serviceName)

    // create client request identifier (cid)
    const cid = createCid()

    // dispatch start
    const getStartArgs = callArgs[method]
    const startPayload = getStartArgs.apply(null, args)
    const startAction = createStart(cid, startPayload)
    store.dispatch(assign({}, startAction))

    // call service method
    return service[method].apply(service, args)
      .then(function (result) {
        const successAction = createSuccess(cid, result)
        store.dispatch(assign({}, successAction))
        throw successAction
      })
      .catch(function (error) {
        const errorAction = createError(cid, error)
        store.dispatch(assign({}, errorAction))
        throw errorAction
      })
  }
}
