'use strict'

const capitalize = require('lodash/capitalize')
const constantCase = require('constant-case')
const constants = require('./constants')

module.exports = createActionTypes
module.exports.createActionType = createActionType

function createActionType (resource, method, section) {
  var RESOURCE = constantCase(resource)
  var GROUP = constantCase(group)
  var SECTION = constantCase(section)

  return `${RESOURCE}_${METHOD}_${SECTION}`
}

function createActionAlias (method, section) {
  var Section = capitalize(section)

  return `${method}${Section}`
}

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
 * @param {String} `resource`
 * @return {Object} `actionTypes`
 * @api public
 */
function createActionTypes (resource, methods, sections) {
  if (methods == null) {
    methods = constants.METHODS
  } else if (sections == null) {
    sections = constants.SECTIONS
  }

  var actionTypes = {}
  methods.forEach(function (method) {
    sections.forEach(function (section) {
      const actionType = createActionType(resource, method, section)
      const actionAlias = createActionAlias(method, section)
      actionTypes[actionType] = actionType
      actionTypes[actionAlias] = actionType
    })
  })
  return actionTypes
}
