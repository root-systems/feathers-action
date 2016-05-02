'use strict'

const test = require('tape')
const values = require('lodash/values')
const pick = require('lodash/pick')
const omit = require('lodash/omit')
const assign = require('lodash/assign')

const createActions = require('../src/actions')
const createReducer = require('../src/reducer')
const types = require('./types')

const Resource = types.Resource

const things = {
  0: { id: 0, name: 'honey', description: 'sweet and delicious.' },
  1: { id: 1, name: 'tea' },
  2: { id: 2, name: 'mug' }
}
const thing = things[0]
const preThing = omit(thing, 'id')

test('find', function (t) {
  const actions = createActions({ Resource })
  const reducer = createReducer({ Resource })

  let state
  const cid = '1234'
  const startAction = actions.find.start(cid, {})
  state = reducer(state, startAction)
  t.deepEqual(state.records, {})
  const successAction = actions.find.success(cid, values(things))
  state = reducer(state, successAction)
  t.deepEqual(state.records, things)
  t.end()
})

test('get', function (t) {
  const actions = createActions({ Resource })
  const reducer = createReducer({ Resource })

  let state
  const cid = '1234'
  const startAction = actions.get.start(cid, { id: thing.id })
  state = reducer(state, startAction)
  t.deepEqual(state.records, {})
  const successAction = actions.get.success(cid, thing)
  t.deepEqual(state.records, { [thing.id]: thing })
  t.end()
})

test('create', function (t) {
  const actions = createActions({ Resource })
  const reducer = createReducer({ Resource })

  let state
  const cid = '1234'
  const startAction = actions.create.start(cid, { data: preThing })
  state = reducer(state, startAction)
  t.deepEqual(state.records, { [cid]: preThing })
  const successAction = actions.create.success(cid, thing)
  t.deepEqual(state.records, { [thing.id]: thing })
  t.end()
})

test('update', function (t) {
  const actions = createActions({ Resource })
  const reducer = createReducer({ Resource })

  let state = { records: { [thing.id]: thing } }
  const nextThing = { id: 0, name: 'bee spit' }
  const cid = '1234'
  const startAction = actions.update.start(cid, { id: 0, data: nextThing })
  state = reducer(state, startAction)
  t.deepEqual(state.records, { [nextThing.id]: thing })
  const successAction = actions.update.success(cid, nextThing)
  state = reducer(state, successAction)
  t.deepEqual(state.records, { [nextThing.id]: nextThing })
  t.end()
})

test('patch', function (t) {
  const actions = createActions({ Resource })
  const reducer = createReducer({ Resource })

  let state = { records: { [thing.id]: thing } }
  const cid = '1234'
  const nextThing = { id: 0, name: 'bee spit' }
  const patchedThing = assign({}, nextThing, thing)
  const startAction = actions.update.start(cid, { id: 0, data: nextThing })
  state = reducer(state, startAction)
  t.deepEqual(state.records, { [nextThing.id]: patchedThing })
  const successAction = actions.patch.success(cid, patchedThing)
  state = reducer(state, successAction)
  t.deepEqual(state.records, { [nextThing.id]: patchedThing })
  t.end()
})

test('remove', function (t) {
  const actions = createActions({ Resource })
  const reducer = createReducer({ Resource })

  let state = { records: { [thing.id]: thing } }
  const cid = '1234'
  const startAction = actions.remove.start(cid, { id: thing.id })
  state = reducer(state, startAction)
  t.deepEqual(state.records, {})
  const successAction = actions.remove.success(cid, thing)
  state = reducer(state, successAction)
  t.deepEqual(state.records, {})
  t.end()
})
