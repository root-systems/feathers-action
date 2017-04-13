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

test('integrates redux and feathers', function (t) {
  const resources = ['cats', 'dogs']
  const app = createTestApp(resources)
  const services = feathersAction([
    'cats',
    'dogs'
  ])
  const cats = feathersAction({
    name: 'cats'
    idField: 'id'
  })
  const dogs = feathersAction('dogs')

  const middleware = feathersAction.middleware({
    client,
    services: [
      'cats',
      'dogs'
    ]
  })
  const store = createTestStore(reducer, middleware)

  // cats.reducer is the reducer
  // cats.actions.find

  store.dispatch(cats.actions.find())
  .then(function (action) {
    t.notOk(action.error)
    t.deepEqual(action.payload, [])
  })

  console.log('actions.get(0)', cats.actions.get(0))

  store.dispatch(cats.actions.get(0))
  .catch(function (action) {
    t.ok(action.error)
    t.equal(action.payload.code, 404)
  })

  store.dispatch(
    cats.actions.create({ name: 'tree' })
  )
  .then(function (action) {
    t.notOk(action.error)
    t.deepEqual(action.payload, { name: 'tree', id: 0 })

    return store.dispatch(cats.actions.get(0))
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
