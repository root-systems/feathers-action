'use strict'

const Tc = require('tcomb')
const mapValues = require('lodash/mapValues')

const constants = require('./constants')
const util = require('./util')
const types = require('./types')

const toCamelCase = util.toCamelCase
const toConstantCase = util.toConstantCase

const sections = constants.SECTIONS
const FEATHERS_ACTION = constants.FEATHERS_ACTION
const mirrorKeyValue = util.mirrorKeyValue

function createActionId (service, method, section) {
  return toConstantCase(service, method, section)
}

const Options = types.Options.extend(
  {}, 'CreateActionIdsOptions'
)

const ActionTypes = Tc.dict(
  Tc.String, Tc.dict(Tc.String,
    Tc.union([Tc.String, types.Symbol])
  ),
  'ActionTypes'
)

module.exports = Tc.func(
  Options, ActionTypes, 'createActionIds'
).of(createActionIds)
module.exports.createActionId = createActionId

function createActionIds (options) {
  options = util.setDefaults(Options, options, {
    methods: constants.DEFAULT_METHODS
  })

  const Resource = options.Resource
  const methods = options.methods

  const service = toCamelCase(Resource.meta.name)

  return mapValues(mirrorKeyValue(methods), function (method) {
    return mapValues(mirrorKeyValue(sections), function (section) {
      if (section === 'call') {
        return FEATHERS_ACTION
      }
      return createActionId(service, method, section)
    })
  })
}
