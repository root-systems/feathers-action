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
  idField: Tc.String,
  idType: Tc.Type
}, {
  name: 'CreatePayloadTypeOptions',
  defaultProps: {
    idField: constants.DEFAULT_ID_FIELD,
    idType: types.Id
  }
})

const PayloadTypes = Tc.dict(
  Tc.String, Tc.dict(Tc.String, Tc.Type),
'ActionCreatorTypes')

module.exports = Tc.func(
  Options, PayloadTypes, 'createPayloadTypes'
).of(createPayloadTypes)

function createPayloadTypes (options) {
  options = Options(options)

  const actionIds = createActionIds(options)

  const { Resource, idField, idType: Id } = options

  const serviceName = toCamelCase(Resource.meta.name)
  const Data = Resource.meta.type
  const DataWithId = Data.extend({ [idField]: Id })
  const ResourceWithIds = Tc.list(DataWithId, Resource.meta.name)
  const PatchData = createPatchType(DataWithId)

  const payloadBase = {
    find: {
      args: {
        params: Params,
      },
      callArgsOrder: [],
      success: ResourceWithIds,
    },
    get: {
      args: {
        id: Id,
        params: Params,
      },
      callArgsOrder: ['id'],
      success: DataWithId,
    },
    create: {
      args: {
        data: Data,
        params: Params,
      },
      callArgsOrder: ['data'],
      success: DataWithId,
    },
    update: {
      args: {
        id: Id,
        data: DataWithId,
        params: Params,
      },
      callArgsOrder: ['id', 'data'],
      success: DataWithId,
    },
    patch: {
      args: {
        id: Id,
        data: PatchData,
        params: Params,
      },
      callArgsOrder: ['id', 'data'],
      success: DataWithId,
    },
    remove: {
      args: {
        id: Id,
        params: Params,
      },
      callArgsOrder: ['id'],
      success: DataWithId,
    }
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
