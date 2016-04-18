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
const createActionTypes = require('./action-types')
const constants = require('./constants')
const types = require('./types')
const util = require('./util')

const Params = types.Params
const Meta = types.Meta
const toCap = util.toCapitalCase
const toCam = util.toCamelCase

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

  const Resource = options.Resource
  const Entity = Resource.meta.type
  const idField = options.idField
  const Id = options.idType

  const Data = Entity
  const SingleResult = Entity
  const ManyResults = Resource

  const service = toCam(Resource.meta.name)
  const BasePayload = Tc.struct({
    service: Tc.enums.of([service])
  })

  const baseMethods = {
    find: [{
      params: Params,
    }, ManyResults],
    get: [{
      id: Id,
      params: Params,
    }, SingleResult],
    create: [{
      data: Data,
      params: Params,
    }, SingleResult],
    update: [{
      id: Id,
      data: Data,
      params: Params,
    }, SingleResult],
    patch: [{
      id: Id,
      data: Data,
      params: Params,
    }, SingleResult],
    remove: [{
      id: Id,
      params: Params,
    }, Tc.Nil],
  }

  const actionTypes = createActionTypes({
    Resource, methods: options.methods
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
      const asyncActionType = actionTypes[asyncActionAlias]

      sofar[asyncActionAlias] = Tc.struct({
        type: Tc.enums.of([FEATHERS_ACTION]),
        payload: MethodPayload.extend(props, asyncActionPayloadName),
      }, asyncActionName)

      const startActionAlias = toCam(name, 'start')
      const startActionName = toCap(name, 'start')
      const startActionPayloadName = toCap(name, 'start', 'payload')
      const startActionType = actionTypes[startActionAlias]

      sofar[startActionAlias] = Tc.struct({
        type: Tc.enums.of([startActionType]),
        payload: MethodPayload.extend(props, startActionPayloadName),
        meta: Meta,
      }, startActionName)

      const successActionAlias = toCam(name, 'success')
      const successActionName = toCap(name, 'success')
      const successActionPayloadName = toCap(name, 'success', 'payload')
      const successActionType = actionTypes[successActionAlias]

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
      const errorActionType = actionTypes[errorActionAlias]

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

  const actionCreators = mapValues(actionCtors, (actionCtor, name) => {
    const type = actionTypes[name]
    const method = words(name)[0]
    if (name in asyncArgs) {
      return function () {
        const getArgs = asyncArgs[name]
        const payload = getArgs.apply(null, arguments)
        return actionCtor({
          type: FEATHERS_ACTION,
          payload: assign({}, payload, { service, method })
        })
      }
    } else if (endsWith(name, 'Error')) {
      return function (cid, payload) {
        return actionCtor({
          type,
          payload: assign({}, payload, { service, method }),
          error: true,
          meta: { cid },
        })
      }
    } else {
      return function (cid, payload) {
        return actionCtor({
          type,
          payload: assign({}, payload, { service, method }),
          meta: { cid },
        })
      }
    }
  })

  return actionCreators
}
