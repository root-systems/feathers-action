'use strict'

const isArray = Array.isArray
const Tc = require('tcomb')
const reduce = require('lodash/reduce')
const assign = require('lodash/assign')
const values = require('lodash/values')
const pick = require('lodash/pick')
const mapValues = require('lodash/mapValues')
const endsWith = require('lodash/endsWith')
const words = require('lodash/words')

const FEATHERS_ACTION = require('./constants').FEATHERS_ACTION
const createActionIds = require('./action-ids')
const constants = require('./constants')
const types = require('./types')
const util = require('./util')

const Params = types.Params
const Meta = types.Meta
const toCapitalCase = util.toCapitalCase
const toCamelCase = util.toCamelCase

const asyncArgs = {
  find: (params) => ({ params }),
  get: (id, params) => ({ id, params }),
  create: (data, params) => ({ data, params }),
  update: (id, data, params) => ({ id, data, params }),
  patch: (id, data, params) => ({ id, data, params }),
  remove: (id, params) => ({ id, params }),
}

const Options = Tc.struct({
  Resource: types.ResourceType,
  idField: Tc.maybe(Tc.String),
  idType: Tc.maybe(Tc.Type),
  methods: Tc.maybe(Tc.list(Tc.String)),
}, 'Options')

const ActionCreators = Tc.dict(Tc.String, Tc.Function, 'ActionCreators')

module.exports = Tc.func(Options, ActionCreators).of(createActionCreators)

function createActionCreators (options) {
  options = util.setDefaults(Options, options, {
    idField: constants.DEFAULT_ID_FIELD,
    idType: types.Id,
    methods: constants.METHODS,
  })

  const payloadTypes = createPayloadTypes(options)
  const actionIds = createActionIds(options)

  const Resource = options.Resource
  const service = toCamelCase(Resource.meta.name)

  const actionCreatorTypes = mapValues(actionIds, function (sections, method) {
    const base = payloadBase[method]

    return mapValues(sections, function (actionId, section) {
      const name = toCapitalCase(service, method, section)
      const payload = payloads[method][section]

      switch (section) {
        'async':
          return Tc.struct({
            type: Tc.enums.of([actionId]),
            payload: payloads[key],
          }, name)
        'start':
        'success':
          return Tc.struct({
            type: Tc.enums.of([actionId]),
            payload: payloads[key],
            meta: Meta,
          }, name)
        'error':
          return Tc.struct({
            type: Tc.enums.of([actionId])
            payload: payloads[key],
            meta: Meta,
            error: Tc.enums.of([true]),
          }, name)
      }
    })
  })

  const sugarActionCreators = 

  const actionCreators = mapValues(serviceActionCreators, function (methodActionCreators, method) {

    return mapValues(methodActionCreators, function (actionCreator, section) {
      switch (section) {
        case 'async':
          return function () {
            const getArgs = asyncArgs[name]
            const payload = getArgs.apply(null, arguments)
            return actionCtor({
              type: FEATHERS_ACTION,
              payload: assign({}, payload, { service, method })
            })
          }
      }
      const actionId = createActionId(service, method, section)
      

    })
    const actionId = actionIds[name]
    if (name in asyncArgs) {
      return function () {
      }
    } else if (endsWith(name, 'Error')) {
      return function (cid, payload) {
        return actionCtor({
          type: actionId,
          payload: assign({}, payload, { service, method }),
          error: true,
          meta: { cid },
        })
      }
    } else {
      return function (cid, payload) {
        return actionCtor({
          type: actionId,
          payload: assign({}, payload, { service, method }),
          meta: { cid },
        })
      }
    }
  })

  // TODO clean up repeated code below
  // maybe iterate through methods and sections
  // like ./action-types.js ?
  const actionCtors = reduce(
    pick(baseMethods, options.methods),
    function (sofar, args, name) {
      const props = args[0]
      const result = args[1]

      const MethodPayload = BasePayload.extend({
        method: Tc.enums.of([name])
      })

      const asyncActionAlias = toCam(name)
      const asyncActionName = toCap(name)
      const asyncActionPayloadName = toCap(name, 'payload')
      const asyncActionType = actionIds[asyncActionAlias]

      sofar[asyncActionAlias] = Tc.struct({
        type: Tc.enums.of([FEATHERS_ACTION]),
        payload: MethodPayload.extend(props, asyncActionPayloadName),
      }, asyncActionName)

      const startActionAlias = toCam(name, 'start')
      const startActionName = toCap(name, 'start')
      const startActionPayloadName = toCap(name, 'start', 'payload')
      const startActionType = actionIds[startActionAlias]

      sofar[startActionAlias] = Tc.struct({
        type: Tc.enums.of([startActionType]),
        payload: MethodPayload.extend(props, startActionPayloadName),
        meta: Meta,
      }, startActionName)

      const successActionAlias = toCam(name, 'success')
      const successActionName = toCap(name, 'success')
      const successActionPayloadName = toCap(name, 'success', 'payload')
      const successActionType = actionIds[successActionAlias]

      sofar[successActionAlias] = Tc.struct({
        type: Tc.enums.of([successActionType]),
        payload: MethodPayload.extend(
          assign({ result }, props, {}),
          successActionPayloadName
        ),
        meta: Meta,
      }, successActionName)

      const errorActionAlias = toCam(name, 'error')
      const errorActionName = toCap(name, 'error')
      const errorActionPayloadName = toCap(name, 'error', 'payload')
      const errorActionType = actionIds[errorActionAlias]

      sofar[errorActionAlias] = Tc.struct({
        type: Tc.enums.of([errorActionType]),
        payload: Tc.Error,
        error: Tc.enums.of([true]),
        meta: Meta,
      }, errorActionName)
      
      return sofar
    },
    {}
  )


  return actionCreators
}
