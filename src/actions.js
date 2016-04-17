'use strict'

const isArray = Array.isArray
const Tc = require('tcomb')
const camelCase = require('lodash/camelCase')
const createAction = require('redux-actions').createAction

const FEATHERS_ACTION = require('./constants').FEATHERS_ACTION
const createActionTypes = require('./action-types')
const constants = require('./constants')
const types = require('./types')

const Cid = types.Cid
const Params = types.Params

const Options = Tc.struct({
  Resource: types.ResourceType,
  idField: Tc.maybe(Tc.String),
  idType: Tc.maybe(Tc.Type),
  metaCreators: Tc.maybe(
    Tc.dict(Tc.String, Tc.Function, 'MetaCreators')
  ),
}, 'Options')

const ActionCreators = Tc.dict(Tc.String, Tc.Function, 'ActionCreators')

module.exports = Tc.func(Options, ActionCreators).of(createActionCreators)

function createActionCreators (options) {
  const Resource = options.Resource
  const Entity = Resource.meta.type
  const idField = options.idField || constants.DEFAULT_ID_FIELD
  const Id = options.idType || types.Id
  const metaCreators = options.metaCreators || {}

  const serviceName = camelCase(resource.meta.name)
  const actionTypes = createActionTypes(serviceName)

  const Data = Model
  const SingleResult = Entity
  const ManyResults = Resource

  const BaseAction = Tc.struct({
    service: Tc.String,
    method: Tc.String
  })

  const Actions = {
    find: BaseAction.extend({
      params: Params
    }),
    findStart: BaseAction.extend({
      params: Params
    }),
    findSuccess: BaseAction.extend({

    })
  }

  return {

    find: createAction(
      FEATHERS_ACTION,
      (params) => asyncHelper('find', { params }),
      metaCreators.find
    ),

    findStart: createAction(
      actionTypes.findStart,
      (cid, params) => ({ cid, params }),
      metaCreators.findStart
    ),

    findSuccess: createAction(
      actionTypes.findSuccess,
      manyEntitiesHandler('findSuccess'),
      metaCreators.findSuccess
    ),

    findError: createAction(
      actionTypes.findError,
      errorHandler('findError'),
      metaCreators.findError
    ),

    get: createAction(
      FEATHERS_ACTION,
      (id, params) => asyncHelper('get', { id, params }),
      metaCreators.get
    ),

    getStart: createAction(
      actionTypes.getStart,
      (cid, id, params) => ({ cid, id, params }),
      metaCreators.getStart
    ),

    getSuccess: createAction(
      actionTypes.getSuccess,
      oneEntityHandler('getSuccess'),
      metaCreators.getSuccess
    ),

    getError: createAction(
      actionTypes.getError,
      errorHandler('getError'),
      metaCreators.getError
    ),

    create: createAction(
      FEATHERS_ACTION,
      (data, params) => asyncHelper('create', { data, params }),
      metaCreators.create
    ),

    createStart: createAction(
      actionTypes.createStart,
      (cid, data, params) => ({ cid, data, params }),
      metaCreators.createStart
    ),

    createSuccess: createAction(
      actionTypes.createSuccess,
      oneEntityHandler('createSuccess'),
      metaCreators.createSuccess
    ),

    createError: createAction(
      actionTypes.createError,
      errorHandler('createError'),
      metaCreators.createError
    ),

    update: createAction(
      FEATHERS_ACTION,
      (id, data, params) => asyncHelper('update', { id, data, params }),
      metaCreators.update
    ),

    updateStart: createAction(
      actionTypes.updateStart,
      (cid, id, data, params) => ({ cid, id, data, params }),
      metaCreators.updateStart
    ),

    updateSuccess: createAction(
      actionTypes.updateSuccess,
      oneEntityHandler('updateSuccess'),
      actionTypes.updateSuccess
    ),

    updateError: createAction(
      actionTypes.updateError,
      errorHandler('updateError'),
      metaCreators.updateError
    ),

    patch: createAction(
      FEATHERS_ACTION,
      (id, data, params) => asyncHelper('patch', { id, data, params }),
      metaCreators.patch
    ),

    patchStart: createAction(
      actionTypes.patchStart,
      (cid, id, data, params) => ({ cid, id, data, params }),
      metaCreators.patchStart
    ),

    patchSuccess: createAction(
      actionTypes.patchSuccess,
      oneEntityHandler('patchSuccess'),
      metaCreators.patchSuccess
    ),

    patchError: createAction(
      actionTypes.patchError,
      errorHandler('patchError'),
      metaCreators.patchError
    ),

    remove: createAction(
      FEATHERS_ACTION,
      (id, params) => asyncHelper('remove', { id, params }),
      metaCreators.remove
    ),

    removeStart: createAction(
      actionTypes.removeStart,
      (cid, id, params) => ({ cid, id, params }),
      metaCreators.removeStart
    ),

    removeSuccess: createAction(
      actionTypes.removeSuccess,
      oneEntityHandler('removeSuccess'),
      metaCreators.removeSuccess
    ),

    removeError: createAction(
      actionTypes.removeError,
      errorHandler('removeError'),
      metaCreators.removeError
    )
  }

  function StartAction = Tc.struct({
    params: Tc.maybe(Tc.Object),
  })

  const Actions = {
    [actionTypes.findStart]
  }


  function asyncHelper (method, payload) {
    return Object.assign({ service: serviceName, method }, payload)
  }

  function oneEntityHandler (actionCreatorName) {
    return function (body, startPayload) {
      assertOneEntity(actionCreatorName, body)
      return Object.assign({ body }, startPayload)
    }
  }

  function manyEntitiesHandler (actionCreatorName) {
    return function (body, startPayload) {
      assertManyEntities(actionCreatorName, body)
      return Object.assign({ body }, startPayload)
    }
  }

  function errorHandler (actionCreatorName) {
    return function (error, startPayload) {
      assertError(actionCreatorName, error)
      return Object.assign(error, startPayload)
    }
  }

  function assertError (actionCreatorName, error) {
    Tc.assert(error != null, `Expected error in ${actionCreatorName}`)
  }

  function assertBody (actionCreatorName, body) {
    Tc.assert(body != null, `Expected body in ${actionCreatorName}`)
  }

  function assertOneEntity (actionCreatorName, body) {
    assertBody(actionCreatorName, body)
    Tc.assert(typeof body === 'object', `Expected one entity in ${actionCreatorName})`)
    Tc.assert(body[key] != null, `Expected entity.${key} in ${actionCreatorName}`)
  }

  function assertManyEntities (actionCreatorName, body) {
    assertBody(actionCreatorName, body)
    Tc.assert(isArray(body), `Expected many entities in ${actionCreatorName}`)
    body.forEach(function (entity) {
      assertOneEntity(actionCreatorName, entity)
    })
  }
}
