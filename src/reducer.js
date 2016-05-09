'use strict'

const Tc = require('tcomb')
const reduceReducers = require('reduce-reducers')
const Loop = require('redux-loop')
const createCid = require('cuid')
const mapValues = require('lodash/mapValues')
const assign = require('lodash/assign')
const isUndefined = require('lodash/isUndefined')
const values = require('lodash/values')
const flatten = require('lodash/flatten')

const createActionIds = require('./action-ids')
const createPayloadTypes = require('./payload-types')
const createActionTypes = require('./action-types')
const createActions = require('./actions')
const types = require('./types')
const constants = require('./constants')
const util = require('./util')

const FEATHERS_ACTION = constants.FEATHERS_ACTION
const toCamelCase = util.toCamelCase
const toCapitalCase = util.toCapitalCase

const callArgs = {
  find: (params) => ({ params }),
  get: (id, params) => ({ id, params }),
  create: (data, params) => ({ data, params }),
  update: (id, data, params) => ({ id, data, params }),
  patch: (id, data, params) => ({ id, data, params }),
  remove: (id, params) => ({ id, params }),
}

const specCreators = {
  find: {
    start: function (action) {
      return startSpec(action)
    },
    success: function (action) {
      return assign({
        records: action.payload.result.reduce(function (sofar, entity) {
          sofar[entity[key]] = { $set: entity }
          return sofar
        }, {})
      }, successSpec(action))
    },
    error: function (action) {
      return errorSpec(action)
    }
  },
  get: {
    start: function (action) {
      return startSpec(action)
    },
    success: function (action) {
      return assign({
        records: {
          [action.payload.id]: { $set: action.payload.result }
        }
      }, successSpec(action))
    },
    error: function (action) {
      return errorSpec(action)
    }
  },
  create: {
    start: function (action) {
      return assign({
        records: {
          [action.meta.cid]: { $set: action.payload.data }
        }
      }, startSpec(action))
    },
    success: function (action) {
      return assign({
        records: {
          $remove: [action.meta.cid],
          [action.payload.result[key]]: { $set: action.payload.result }
        }
      }, successSpec(action))
    },
    error: function (action) {
      return assign({
        records: {
          $remove: [action.meta.cid]
        }
      }, errorSpec(action))
    }
  },
  update: {
    start: function (action) {
      return assign({
        records: {
          [action.payload.id]: { $set: action.payload.data }
        }
      }, startSpec(action))
    },
    success: function (action) {
      return assign({
        records: {
          [action.payload.id]: { $set: action.payload.result }
        }
      }, successSpec(action))
    },
    error: function (action) {
      return assign({
        // TODO reset to before update
        records: {
          $remove: [action.payload.id]
        }
      }, errorSpec(action))
    }
  },
  patch: {
    start: function (action) {
      return assign({
        records: {
          [action.payload.id]: { $merge: action.payload.data }
        }
      }, startSpec(action))
    },
    success: function (action) {
      return assign({
        records: {
          [action.payload.id]: { $merge: action.payload.result }
        }
      }, successSpec(action))
    },
    error: function (action) {
      return assign({
        // TODO reset to before patch
        records: {
          $remove: [action.payload.id]
        }
      }, errorSpec(action))
    }
  },
  remove: {
    start: function (action) {
      return assign({
        records: {
          $remove: [action.payload.id]
        }
      }, startSpec(action))
    },
    success: function (action) {
      return assign({
        records: {
          $remove: [action.payload.id]
        }
      }, successSpec(action))
    },
    error: function (action) {
      return assign({
        // TODO reset to before remove
        records: {
          $remove: [action.payload.id]
        }
      }, errorSpec(action))
    }
  }
}

const Options = types.Options.extend({
  idType: Tc.maybe(Tc.Type)
}, 'CreateReducerOptions')

const Reducer = Tc.Function

module.exports = Tc.func(
  Options, Reducer, 'createReducer'
).of(createReducer)

module.exports.callEffect = callEffect

function createReducer (options) {
  options = util.setDefaults(Options, options, {
    idType: types.Id
  })

  const actionIds = createActionIds(options)
  const actionTypes = createActionTypes(options)
  const payloadTypes = createPayloadTypes(options)
  const actions = createActions(options)

  const Resource = options.Resource
  const Id = options.idType
  const Cid = types.Cid

  const serviceName = toCamelCase(Resource.meta.name)
  const Data = Resource.meta.type

  const StartPayload = sectionUnion(serviceName, payloadTypes, 'start')
  const SuccessPayload = sectionUnion(serviceName, payloadTypes, 'success')
  const ErrorPayload = sectionUnion(serviceName, payloadTypes, 'error')

  const Records = Tc.dict(Id, Data, 'Records')
  const Pending = Tc.dict(Cid, StartPayload, 'Pending')
  const Success = Tc.dict(Cid, SuccessPayload, 'Success')
  const Error = Tc.dict(Cid, ErrorPayload, 'Error')

  const State = Tc.struct({
    records: Records,
    pending: Pending,
    success: Success,
    error: Error,
  })

  const reducers = mapValues(actionTypes, function (sections, method) {
    const sectionReducers = mapValues(sections, function (actionType, section) {
      const specCreator = specCreators[method][section]
      const actionId = actionIds[method][section]

      return createActionReducer(State, actionType, actionId, specCreator)
    })

    return assign(sectionReducers, {
      call: function (state, action) {
        if (
          action.type === FEATHERS_ACTION
          && action.payload.serviceName === serviceName
        ) {
          return callReducer(actions[method], sectionReducers.start, state, action)
        }
        return state
      }
    })
  })

  const reducer = unifyReducers(reducers)

  return defaultReducer(reducer, {
    records: {},
    pending: {},
    success: {},
    error: {}
  })
}

function defaultReducer (reducer, defaultState) {
  return function (state, action) {
    if (isUndefined(state)) {
      state = defaultState
    }
    return reducer(state, action)
  }
}

function createActionReducer (State, actionType, actionId, specCreator) {
  return function (state, action) {
    return (action.type === actionId) ?
      State.update(
        State(state),
        specCreator(actionType(action))
      ) : state
  }
}

function startSpec (action) {
  return {
    pending: { $set: { [action.meta.cid]: action } }
  }
}

function successSpec (action) {
  return {
    pending: { $remove: [action.meta.cid] },
    success: { $set: { [action.meta.cid]: action } }
  }
}

function errorSpec (action) {
  return {
    pending: { $remove: [action.meta.cid] },
    error: { $set: { [action.meta.cid]: action } }
  }
}

function sectionUnion (serviceName, payloadTypes, section) {
  const sectionTypes = values(mapValues(payloadTypes, section))
  const sectionTypeName = toCapitalCase(serviceName, section, 'payload')

  const sectionUnion = Tc.union(sectionTypes, sectionTypeName)

  sectionUnion.dispatch = function (value) {
    const valueType = value.type.toLowerCase().split('_')
    const valueService = valueType[0]
    const method = valueType[1]
    const valueSection = valueType[2]

    Tc.assert(valueService === serviceName, 'Unexpected serviceName in action.type, expected ' + serviceName + ', received ' + valueService)
    Tc.assert(valueSection === section, 'Unexpected section in action.type, expected ' + section + ', received ' + valueSection)

    return payloadTypes[method][valueSection]
  }

  return sectionUnion
}

function unifyReducers (reducers) {
  const reducersPerMethod = mapValues(reducers, values)
  const serviceReducers = flatten(values(reducersPerMethod))
  return reduceReducers.apply(null, serviceReducers)
}

function callReducer (methodActions, startReducer, state, action) {
  const payload = action.payload

  const service = payload.service
  const method = payload.method
  const args = payload.args

  const cid = createCid()
  const startPayload = callArgs[method].apply(null, args)
  const startAction = methodActions.start(cid, startPayload)

  console.log('state', state)
  console.log('action', action)
  console.log('next state', startReducer(state, startAction))

  return Loop.loop(
    startReducer(state, startAction),
    Loop.Effects.promise(callEffect, methodActions, cid, payload)
  )
}

function callEffect (methodActions, cid, payload) {
  const service = payload.service
  const method = payload.method
  const args = payload.args

  return service[method].apply(service, args)
    .then(function (result) {
      const successAction = methodActions.success(cid, result)
      return assign({}, successAction)
    })
    .catch(function (error) {
      const errorAction = methodActions.error(cid, error)
      return assign({}, errorAction)
    })
}
