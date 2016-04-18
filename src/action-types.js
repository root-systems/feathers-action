const mapValues = require('lodash/mapValues')

const createActionIds = require('./action-ids')
const createPayloadTypes = require('./payload-types')

const Options = Tc.struct({
  Resource: types.ResourceType
}, 'Options')

const ActionCreatorTypes = Tc.dict(
  Tc.String, Tc.dict(Tc.String, Tc.Function),
'ActionCreatorTypes')

module.exports = Tc.func(Options, ActionCreatorTypes)
  .of(createActionTypes)

function createActionTypes (options) {
  const actionIds = createActionIds(options)
  const payloadType = createPayloadTypes(options)

  const Resource = options.Resource
  const service = toCamelCase(Resource.meta.name)

  const actionCreatorTypes = mapValues(actionIds, function (sections, method) {
    return mapValues(sections, function (actionId, section) {
      const name = toCapitalCase(service, method, section)
      const payloadType = payloadTypes[method][section]

      switch (section) {
        'async':
          return Tc.struct({
            type: Tc.enums.of([actionId]),
            payloadType: payloadType,
          }, name)
        'start':
        'success':
          return Tc.struct({
            type: Tc.enums.of([actionId]),
            payloadType: payloadType,
            meta: Meta,
          }, name)
        'error':
          return Tc.struct({
            type: Tc.enums.of([actionId])
            payloadType: payloadType,
            meta: Meta,
            error: Tc.enums.of([true]),
          }, name)
      }
    })
  })
