'use strict'

const constants = require('./constants')
const Tc = require('tcomb')

const util = require('./util')
const types = require('./types')

function createActionType (resource, method, section) {
  return util.toConstantCase(resource, method, section)
}

function createActionAlias (method, section) {
  return util.toCamelCase(method, section)
}

const Options = Tc.struct({
  Resource: types.ResourceType,
  alias: Tc.maybe(Tc.Boolean),
  methods: Tc.maybe(Tc.list(Tc.String)),
  sections: Tc.maybe(Tc.list(Tc.String))
})

const ActionTypes = Tc.dict(
  Tc.String, Tc.String, 'ActionTypes'
)

module.exports = Tc.func(
  Options, ActionTypes, 'createActionTypes'
).of(createActionTypes)
module.exports.createActionType = createActionType

/*
 * Given a resource name, returns respective feathers action types.
 *
 * Action types are represented as an object mapping
 * action type constants and aliases to action type constants.
 *
 * ```js
 * createActionTypes('users')
 * // => {
 * //   USERS_FIND_START: USERS_FIND_START,
 * //   USERS_FIND_SUCCESS: USERS_FIND_SUCCESS,
 * //   USERS_FIND_ERROR: USERS_FIND_ERROR,
 * //   findStart: USERS_FIND_START,
 * //   findSuccess: USERS_FIND_SUCCESS,
 * //   findError: USERS_FIND_ERROR,
 * //   USERS_GET_START: USERS_GET_START,
 * //   ...
 * //   USERS_CREATE_START: USERS_CREATE_START,
 * //   ...
 * //   USERS_UPDATE_START: USERS_UPDATE_START,
 * //   ...
 * //   USERS_PATCH_START: USERS_PATCH_START,
 * //   ...
 * //   USERS_REMOVE_START: USERS_REMOVE_START,
 * //   USERS_REMOVE_SUCCESS: USERS_REMOVE_SUCCESS,
 * //   USERS_REMOVE_ERROR: USERS_REMOVE_ERROR,
 * //   removeStart: USERS_REMOVE_START,
 * //   removeSuccess: USERS_REMOVE_SUCCESS,
 * //   removeError: USERS_REMOVE_ERROR,
 * // }
 * ```
 */
function createActionTypes (options) {
  options = util.setDefaults(Options, options, {
    alias: true,
    methods: constants.METHODS,
    sections: constants.SECTIONS
  })

  const resourceName = options.Resource.meta.name

  var actionTypes = {}
  options.methods.forEach(function (method) {
    options.sections.forEach(function (section) {
      const actionType = createActionType(resourceName, method, section)
      actionTypes[actionType] = actionType

      if (options.alias) {
        const actionAlias = createActionAlias(method, section)
        actionTypes[actionAlias] = actionType
      }
    })
  })
  return actionTypes
}
