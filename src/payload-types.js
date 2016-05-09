'use strict'

const Tc = require('tcomb')
const mapValues = require('lodash/mapValues')
const assign = require('lodash/assign')

const createActionIds = require('./action-ids')
const util = require('./util')
const types = require('./types')
const constants = require('./constants')

const toCamelCase = util.toCamelCase
const toCapitalCase = util.toCapitalCase
const Params = types.Params
const createPatchType = types.createPatchType

const Options = types.Options.extend({
  idField: Tc.maybe(Tc.String),
  idType: Tc.maybe(Tc.Type)
}, 'CreatePayloadTypeOptions')

const PayloadTypes = Tc.dict(
  Tc.String, Tc.dict(Tc.String, Tc.Type),
'ActionCreatorTypes')

module.exports = Tc.func(
  Options, PayloadTypes, 'createPayloadTypes'
).of(createPayloadTypes)

function createPayloadTypes (options) {
  options = util.setDefaults(Options, options, {
    idField: constants.DEFAULT_ID_FIELD,
    idType: types.Id
  })

  const actionIds = createActionIds(options)

  const Resource = options.Resource
  const idField = options.idField
  const Id = options.idType

  const serviceName = toCamelCase(Resource.meta.name)
  const Data = Resource.meta.type
  const PatchData = createPatchType(Data)

  const payloadBase = {
    find: {
      args: {
        params: Params,
      },
      callArgsOrder: [],
      success: Resource,
    },
    get: {
      args: {
        id: Id,
        params: Params,
      },
      callArgsOrder: ['id'],
      success: Data,
    },
    create: {
      args: {
        data: Data,
        params: Params,
      },
      callArgsOrder: ['data'],
      success: Data,
    },
    update: {
      args: {
        id: Id,
        data: Data,
        params: Params,
      },
      callArgsOrder: ['id', 'data'],
      success: Data,
    },
    patch: {
      args: {
        id: Id,
        data: PatchData,
        params: Params,
      },
      callArgsOrder: ['id', 'data'],
      success: Data,
    },
    remove: {
      args: {
        id: Id,
        params: Params,
      },
      callArgsOrder: ['id'],
      success: Data,
    },
  }

  return mapValues(actionIds, function (sections, method) {
    const base = payloadBase[method]

    return mapValues(sections, function (actionId, section) {
      const name = toCapitalCase(serviceName, method, section, 'payload')

      switch (section) {
        case 'call':
          return Tc.struct({
            service: Tc.Any,
            serviceName: Tc.enums.of([serviceName]),
            method: Tc.enums.of([method]),
            args: callArgsType(base)
          }, name)
        case 'start':
          return Tc.struct(base.args, name)
        case 'success':
          return base.success
        case 'error':
          return Tc.Error
      }
    })
  })
}

function callArgsType (base) {
  const baseCallArgs = base.callArgsOrder.map(function (name) {
    return base.args[name]
  })
  const callArgsTypes = [
    Tc.tuple(baseCallArgs),
    Tc.tuple(baseCallArgs.concat([Params])),
  ]
  const callArgsType = Tc.union(callArgsTypes)
  callArgsType.dispatch = function (value) {
    if (value.length === base.callArgsOrder.length) {
      return callArgsTypes[0]
    } else if (value.length === base.callArgsOrder.length + 1) {
      return callArgsTypes[1]
    }
  }
  return callArgsType
}
