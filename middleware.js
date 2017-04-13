'use strict'

const Tc = require('tcomb')
const assign = require('lodash/assign')

const createActionCreators = require('./actions')
const constants = require('./constants')
const types = require('./types')

const FEATHERS_ACTION = constants.FEATHERS_ACTION

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

    const service = client.service(action.payload.serviceName)

    return next(
      assign({
        payload: assign({ service }, action.payload)
      }, action)
    )
  }
}
