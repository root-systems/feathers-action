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

  const service = toCamelCase(Resource.meta.name)
  const Data = Resource.meta.type

  const payloadBase = {
    find: {
      args: {
        params: Params,
      },
      success: Resource,
    },
    get: {
      args: {
        id: Id,
        params: Params,
      },
      success: Data,
    },
    create: {
      args: {
        data: Data,
        params: Params,
      },
      success: Data,
    },
    update: {
      args: {
        id: Id,
        data: Data,
        params: Params,
      },
      success: Data,
    },
    patch: {
      args: {
        id: Id,
        data: Data,
        params: Params,
      },
      success: Data,
    },
    remove: {
      args: {
        id: Id,
        params: Params,
      },
      success: Tc.Nil,
    },
  }

  return mapValues(actionIds, function (sections, method) {
    const base = payloadBase[method]

    return mapValues(sections, function (actionId, section) {
      const name = toCapitalCase(service, method, section, 'payload')

      switch (section) {
        case 'call':
          return Tc.struct(assign({
            service: Tc.enums.of([service]),
            method: Tc.enums.of([method]),
          }, base.args), name)
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
