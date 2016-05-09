'use strict'

const test = require('tape')
const Tc = require('tcomb')
const feathers = require('feathers')
const memory = require('feathers-memory')
const redux = require('redux')
const Loop = require('redux-loop')

const types = require('./types')
const feathersAction = require('../src')
const util = require('../src/util')

const toCamelCase = util.toCamelCase
const createActions = feathersAction.createActions
const createReducer = feathersAction.createReducer
const createMiddleware = feathersAction.createMiddleware

const Resource = types.Resource

test('integrates redux, feathers, and tcomb', function (t) {
  const app = createTestApp([Resource])

  const reducer = createReducer({ Resource })
  const actions = createActions({ Resource })
  const middleware = createMiddleware({ Resource, client: app })

  const store = createTestStore(reducer, middleware)

  store.dispatch(actions.find())
  .then(function (action) {
    t.notOk(action.error)
    t.deepEqual(action.payload, [])
  })

  console.log('actions.get(0)', actions.get(0))

  store.dispatch(actions.get(0))
  .catch(function (action) {
    t.ok(action.error)
    t.equal(action.payload.code, 404)
  })

  store.dispatch(
    actions.create({ name: 'tree' })
  )
  .then(function (action) {
    t.notOk(action.error)
    t.deepEqual(action.payload, { name: 'tree', id: 0 })

    return store.dispatch(actions.get(0))
  })
  .then(function (action) {
    t.notOk(action.error)
    t.equal(action.payload.id, 0)
    t.deepEqual(action.payload, { name: 'tree', id: 0 })
    t.end()
  })
})

function createTestStore (reducer, middleware) {
  return redux.createStore(
    reducer,
    redux.compose(
      Loop.install(),
      redux.applyMiddleware(middleware)
    )
  )
}

function createTestApp (Resources) {
  const app = feathers()

  Resources.forEach(function (Resource) {
    const serviceName = toCamelCase(Resource.meta.name)
    app.use('/' + serviceName, memory())
  })

  return app
}
