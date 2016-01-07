const createActionCreators = require('feathers-action-creators')
const t = require('tcomb')
const cuid = require('cuid')

module.exports = {
  createActionCreators: __createActionCreators,
  createReducer: __createActionReducer,
  createActionTypes: __createActionTypes
}

function __createActionCreators (app, Collection, config) {
  const serviceName = Collection.meta.name
  const service = app.service(serviceName)
  const Model = Collection.meta.type

  return createActionCreators(service, Object.assign({
    update: Model.update.bind(Model)
  }, config)
}

function __createActionReducer (Collection, config) {
  const serviceName = Collection.meta.name
  const service = app.service(serviceName)

  return createActionCreators(serviceName, Object.assign({
    cid: cuid
  }, config)
}

function __createActionTypes (Collection) {
  const serviceName = Collection.meta.name

  return __createActionTypes(Collection)
}
