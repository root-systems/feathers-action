'use strict'

const t = require('tcomb')
const cuid = require('cuid')
const camelCase = require('lodash/camelCase')
const createActionCreators = require('./actions')
const createActionTypes = require('./action-types')
const createActionReducer = require('./reducer')

module.exports = {
  createActionCreators: __createActionCreators,
  createActions: __createActionCreators,
  createActionReducer: __createActionReducer,
  createReducer: __createActionReducer,
  createActionTypes: __createActionTypes,
  createTypes: __createActionTypes
}

function __createActionCreators (app, Collection, config) {
  const serviceName = camelCase(Collection.meta.name)
  const service = app.service(serviceName)

  // HACK if service.name is not set, fix it
  if (service.name == null) {
    service.name = serviceName
  }

  const Model = Collection.meta.type

  return createActionCreators(service, Object.assign({
    cid: cuid
  }, config))
}

function __createActionReducer (Collection, config) {
  const serviceName = camelCase(Collection.meta.name)
  const Model = Collection.meta.type

  return createActionReducer(serviceName, Object.assign({
    update: t.update
  }, config))
}

function __createActionTypes (Collection) {
  const serviceName = camelCase(Collection.meta.name)

  return __createActionTypes(serviceName)
}
