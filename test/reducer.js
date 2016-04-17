'use strict'

const test = require('tape')
const update = require('tcomb/lib/update')
const values = require('lodash/values')

const createActions = require('../src/actions')
const createReducer = require('../src/reducer')

test('find', function (t) {
  const actions = createActions('things')
  const reducer = createReducer('things', { update })

  let state
  const cid = '1234'
  const things = {
    0: { id: 0, name: 'honey' },
    1: { id: 1, name: 'tea' },
    2: { id: 2, mame: 'mug' }
  }
  const startAction = actions.findStart(cid, { $limit: 3 })
  state = reducer(state, startAction)
  t.deepEqual(state.records, {})
  state = reducer(state, actions.findSuccess(values(things), startAction.payload))
  t.deepEqual(state.records, things)
  t.end()
})

test('get', function (t) {
  const actions = createActions('things')
  const reducer = createReducer('things', { update })

  let state
  const cid = '1234'
  const startAction = actions.getStart(cid, 0)
  state = reducer(state, startAction)
  t.deepEqual(state.records, {})
  state = reducer(state, actions.getSuccess({ id: 0, name: 'honey' }, startAction.payload))
  t.deepEqual(state.records, { 0: { id: 0, name: 'honey' } })
  t.end()
})

test('create', function (t) {
  const actions = createActions('things')
  const reducer = createReducer('things', { update })

  let state
  const cid = '1234'
  const startAction = actions.createStart(cid, { name: 'honey' })
  state = reducer(state, startAction)
  t.deepEqual(state.records, { [cid]: { name: 'honey' } })
  state = reducer(state, actions.createSuccess({ id: 0, name: 'honey' }, startAction.payload))
  t.deepEqual(state.records, { 0: { id: 0, name: 'honey' } })
  t.end()
})

test('update', function (t) {
  const actions = createActions('things')
  const reducer = createReducer('things', { update })

  let state = { records: { 0: { id: 0, name: 'honey', description: 'sweet and delicious.' } } }
  const cid = '1234'
  const startAction = actions.updateStart(cid, 0, { id: 0, name: 'bee spit' })
  state = reducer(state, startAction)
  t.deepEqual(state.records, { 0: { id: 0, name: 'bee spit' } })
  state = reducer(state, actions.updateSuccess({ id: 0, name: 'bee spit' }, startAction.payload))
  t.deepEqual(state.records, { 0: { id: 0, name: 'bee spit' } })
  t.end()
})

test('patch', function (t) {
  const actions = createActions('things')
  const reducer = createReducer('things', { update })

  let state = { records: { 0: { id: 0, name: 'honey', description: 'sweet and delicious.' } } }
  const cid = '1234'
  const startAction = actions.patchStart(cid, 0, { id: 0, name: 'bee spit' })
  state = reducer(state, startAction)
  t.deepEqual(state.records, { 0: { id: 0, name: 'bee spit', description: 'sweet and delicious.' } })
  state = reducer(state, actions.patchSuccess({ id: 0, name: 'bee spit' }, startAction.payload))
  t.deepEqual(state.records, { 0: { id: 0, name: 'bee spit', description: 'sweet and delicious.' } })
  t.end()
})

test('remove', function (t) {
  const actions = createActions('things')
  const reducer = createReducer('things', { update })

  let state = { records: { 0: { id: 0, name: 'honey' } } }
  const cid = '1234'
  const startAction = actions.removeStart(cid, 0)
  state = reducer(state, startAction)
  t.deepEqual(state.records, {})
  state = reducer(state, actions.removeSuccess({ id: 0, name: 'honey' }, startAction.payload))
  t.deepEqual(state.records, {})
  t.end()
})
