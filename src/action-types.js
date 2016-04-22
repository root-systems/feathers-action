const Tc = require('tcomb')
const mapValues = require('lodash/mapValues')

const createActionIds = require('./action-ids')
const createPayloadTypes = require('./payload-types')
const util = require('./util')
const types = require('./types')

const toCapitalCase = util.toCapitalCase
const toCamelCase = util.toCamelCase
const Meta = types.Meta

const Options = types.Options.extend(
  {}, 'CreateActionTypesOptions'
)

const ActionTypes = Tc.dict(
  Tc.String, Tc.dict(Tc.String, Tc.Type),
'ActionTypes')

module.exports = Tc.func(Options, ActionTypes)
  .of(createActionTypes)

function createActionTypes (options) {
  const actionIds = createActionIds(options)
  const payloadTypes = createPayloadTypes(options)

  const Resource = options.Resource
  const service = toCamelCase(Resource.meta.name)

  return mapValues(actionIds, function (sections, method) {
    return mapValues(sections, function (actionId, section) {
      const name = toCapitalCase(service, method, section)
      const payloadType = payloadTypes[method][section]

      switch (section) {
        case 'call':
          return Tc.struct({
            type: Tc.enums.of([actionId]),
            payload: payloadType
          }, name)
        case 'start':
        case 'success':
          return Tc.struct({
            type: Tc.enums.of([actionId]),
            payload: payloadType,
            meta: Meta
          }, name)
        case 'error':
          return Tc.struct({
            type: Tc.enums.of([actionId]),
            payload: payloadType,
            meta: Meta,
            error: Tc.enums.of([true]),
          }, name)
      }
    })
  })
}
