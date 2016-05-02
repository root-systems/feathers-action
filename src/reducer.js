'use strict'

const Tc = require('tcomb')
const reduceReducers = require('reduce-reducers')
const mapValues = require('lodash/mapValues')
const assign = require('lodash/assign')
const isUndefined = require('lodash/isUndefined')
const values = require('lodash/values')
const flatten = require('lodash/flatten')

const createActionIds = require('./action-ids')
const createPayloadTypes = require('./payload-types')
const createActionTypes = require('./action-types')
const types = require('./types')
const constants = require('./constants')
const util = require('./util')

const toCamelCase = util.toCamelCase
const toCapitalCase = util.toCapitalCase

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
          [action.payload.cid]: { $set: action.payload.data }
        }
      }, startSpec(action))
    },
    success: function (action) {
      return assign({
        records: {
          $remove: [action.payload.cid],
          [action.payload.result[key]]: { $set: action.payload.result }
        }
      }, successSpec(action))
    },
    error: function (action) {
      return assign({
        records: {
          $remove: [action.payload.cid]
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


function createReducer (options) {
  options = util.setDefaults(Options, options, {
    idType: types.Id
  })

  const actionIds = createActionIds(options)
  const actionTypes = createActionTypes(options)
  const payloadTypes = createPayloadTypes(options)

  const Resource = options.Resource
  const Id = options.idType
  const Cid = types.Cid

  const service = toCamelCase(Resource.meta.name)
  const Data = Resource.meta.type

  const StartPayload = sectionUnion(service, payloadTypes, 'start')
  const SuccessPayload = sectionUnion(service, payloadTypes, 'success')
  const ErrorPayload = sectionUnion(service, payloadTypes, 'error')

  const Records = Tc.dict(Id, Data, 'Records')
  const Pending = Tc.dict(Cid, StartPayload, 'Pending')
  const Success = Tc.dict(Cid, SuccessPayload, 'Success')
  const Error = Tc.dict(Cid, ErrorPayload, 'Error')

  const State = Tc.struct({
    records: Data,
    pending: Pending,
    success: Success,
    error: Error,
  })

  const reducers = mapValues(actionTypes, function (sections, method) {
    return mapValues(sections, function (actionType, section) {
      const specCreator = specCreators[method][section]
      const actionId = actionIds[method][section]

      return Tc.func([State, actionType], State)
        .of(createActionReducer(State, actionId, specCreator))
    })
  })

  const reducer = unifyReducers(reducers)

  return defaultReducer(reducer, {
    records: {}
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

function createActionReducer (State, actionId, specCreator) {
  return function (state, action) {
    return (action.type === actionId) ?
      State.update(state, specCreator(action))
      : state
  }
}

function startSpec (action) {
  return {
    pending: { $set: { [action.payload.cid]: action } }
  }
}

function successSpec (action) {
  return {
    pending: { $remove: [action.payload.cid] },
    success: { $set: { [action.payload.cid]: action } }
  }
}

function errorSpec (action) {
  return {
    pending: { $remove: [action.payload.cid] },
    error: { $set: { [action.payload.cid]: action } }
  }
}

function sectionUnion (service, payloadTypes, section) {
  const sectionTypes = values(mapValues(payloadTypes, section))
  const sectionTypeName = toCapitalCase(service, section, 'payload')

  return Tc.union(sectionTypes, sectionTypeName)
}

function unifyReducers (reducers) {
  const reducersPerMethod = mapValues(reducers, values)
  const serviceReducers = flatten(values(reducersPerMethod))
  return reduceReducers.apply(null, reducers)
}
