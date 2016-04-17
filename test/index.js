'use strict'

const test = require('tape')
const Tc = require('tcomb')
const feathers = require('feathers')
const memory = require('feathers-memory')
const redux = require('redux')
const thunk = require('redux-thunk')

const feathersAction = require('../src')
const createActions = feathersAction.createActions
const createReducer = feathersAction.createReducer

test('integrates redux, feathers, and tcomb', function (t) {
  const Thing = Tc.struct({
    id: Tc.Number,
    name: Tc.String,
    description: Tc.String
  })
  const Things = Tc.list(Thing, 'Things')
  const app = createTestApp([Things])

  const reducer = createReducer(Things)
  const actions = createActions(app, Things)

  const store = createTestStore(reducer)

  store.dispatch(actions.find())
  .then(function (action) {
    t.notOk(action.error)
    t.deepEqual(action.payload.body, [])
  })

  store.dispatch(actions.get(0))
  .then(function (action) {
    t.equal(action.payload.code, 404)
  })

  store.dispatch(
    actions.create({ name: 'tree' })
  )
  .then(function (action) {
    t.notOk(action.error)
    t.deepEqual(action.payload.body, { name: 'tree', id: 0 })

    return store.dispatch(actions.get(0))
  })
  .then(function (action) {
    t.notOk(action.error)
    t.equal(action.payload.id, 0)
    t.deepEqual(action.payload.body, { name: 'tree', id: 0 })
    t.end()
  })
})

function createTestStore (reducer) {
  return redux.applyMiddleware(thunk)(redux.createStore)(reducer)
}

function createTestApp (collections) {
  const app = feathers()

  collections.forEach(function (collection) {
    app.use('/' + collection.meta.name, memory())
  })

  return app
}
