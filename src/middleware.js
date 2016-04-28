'use strict'

const Tc = require('tcomb')

const createActionCreators = require('./actions')
const constants = require('./constants')
const types = require('./types')

const FEATHERS_ACTION = constants.FEATHERS_ACTION

const Options = types.Options({
  client: Tc.Object
})

const Middleware = Tc.Function


module.exports = Tc.func(
  Options, Middlware, 'createMiddleware'
).of(createMiddleware)

// https://github.com/agraboso/redux-api-middleware/blob/master/src/middleware.js
// http://redux.js.org/docs/advanced/Middleware.html

function createMiddleware (options) {
  const actionCreators = createSyncActionCreators(collection)

  return (store) => (next) => (action) => {
    if (action.type !== FEATHERS_ACTION) {
      return next(action)
    }

    // get payload, including method name
    // dispatch start
    // 
    // dispatch end
    //
  }
}

/*
    return function () {
      const args = slice(arguments)
      const cid = config.cid()

      return (dispatch) => {
        const startCreator = actionCreators[`${methodName}Start`]
        const startAction = startCreator.apply(actionCreators, [cid].concat(args))
        dispatch(startAction)

        return service[methodName].apply(service, args)
          .then(body => {
            const successCreator = actionCreators[`${methodName}Success`]
            const successAction = successCreator(body, startAction.payload)

            dispatch(successAction)
            return successAction
          })
          .catch(error => {
            const errorCreator = actionCreators[`${methodName}Error`]
            const errorAction = errorCreator(error, startAction.payload)

            dispatch(errorAction)
            return errorAction
          })
      }
    }
  }
*/
