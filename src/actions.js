'use strict'

const Tc = require('tcomb')
const mapValues = require('lodash/mapValues')
const assign = require('lodash/assign')

const createActionTypes = require('./action-types')
const createActionIds = require('./action-ids')
const constants = require('./constants')
const types = require('./types')
const util = require('./util')

const toCamelCase = util.toCamelCase

const Options = types.Options.extend(
  {}, 'CreateActionCreatorOptions'
)

const ActionCreators = Tc.dict(Tc.String, Tc.Function, 'ActionCreators')

module.exports = Tc.func(Options, ActionCreators)
  .of(createActionCreators)

function createActionCreators (options) {
  const Resource = options.Resource
  const service = toCamelCase(Resource.meta.name)

  const actionIds = createActionIds(options)
  const actionTypes = createActionTypes(options)

  const actionCreators = mapValues(actionIds, function (sections, method) {
    return mapValues(sections, function (actionId, section) {
      const Action = actionTypes[method][section]

      switch (section) {
        case 'call':
          return function () {
            const args = Array.prototype.slice.call(arguments)
            const aCtors = actionCreators[method]

            return Action({
              type: actionId,
              payload: {
                service, method,
                args,
                start: aCtors.start,
                success: aCtors.success,
                error: aCtors.error,
              },
            })
          }
        case 'error':
          return function (cid, payload) {
            return Action({
              type: actionId,
              payload,
              error: true,
              meta: { cid },
            })
          }
        case 'start':
        case 'success':
          return function (cid, payload) {
            return Action({
              type: actionId,
              payload,
              meta: { cid },
            })
          }
      }
    })
  })

  // return action creators that match feather's api
  // attach per-section creators to these
  return mapValues(actionCreators, function (creatorsBySection, method) {
    const createCallAction = creatorsBySection.call
    return assign(createCallAction, creatorsBySection)
  })
}
