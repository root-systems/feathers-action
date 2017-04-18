'use strict'

const test = require('tape')
const deepFreeze = require('deep-freeze')

const feathersAction = require('../')
const cats = feathersAction('cats')

const catsRecords = {
  0: { id: 0, name: 'honey', description: 'sweet and delicious.' },
  1: { id: 1, name: 'tea' },
  2: { id: 2, name: 'mug' }
}

const cat = catsRecords[0]

const defaultState = {
  cats: {},
  feathersAction: {
    requests: {} 
  }
}

deepFreeze(defaultState)
deepFreeze(catsRecords)

test('updater returns correct default state', function(t) {
  state = cats.updater({type: 'woof'})() 
  t.deepEqual(state, defaultState)
  t.end()
})

test('set sets the new state by id', function (t) {
  const { actions, updater } = cats 
  const expectedState = Object.assign({}, defaultState, {cats: {0: cat}})
  const action = actions.set(0, cat)

  const newState = updater(action)(state)
  t.deepEqual(newState, expectedState)
  t.end()
})


test('start sets the request at the cid in feathersRequest', function (t) {
  const { actions, updater } = cats 
  const cid = 'abcd'
  const request = {
    method: 'create'
    service: 'cats'
    args: {
    
    }
  }
  const expectedState = Object.assign({}, defaultState, {feathersAction: requests: {[cid]: request}})

  const action = actions.start(cid, request)

  const newState = updater(action)(state)
  t.deepEqual(newState, expectedState)
  t.ok(newState.feathersAction.requests[cid].startTime)
  t.end()
})

test('complete', function (t) {
  const { actions, updater } = cats 
  const cid = 'abcd'
  const request = {
    method: 'create'
    service: 'cats'
    args: {
    
    }
  }
  const initialState = Object.assign({}, defaultState, {feathersAction: requests: {[cid]: request}})
  deepFreeze(initialState)

  const expectedState = Object.assign({}, initialState, {feathersAction: requests: {[cid]: {
    result: cat,
    error: null,
  }}})

  const action = actions.complete(cid, cat)

  const newState = updater(action)(initialState)
  t.deepEqual(newState, expectedState)
  t.ok(newState.feathersAction.requests[cid].completeTime)
  t.end()
})

test('error', function (t) {
  const { actions, updater } = cats 
  const cid = 'abcd'
  const request = {
    method: 'create'
    service: 'cats'
    args: {
    
    }
  }
  const initialState = Object.assign({}, defaultState, {feathersAction: requests: {[cid]: request}})
  deepFreeze(initialState)

  const expectedState = Object.assign({}, initialState, {feathersAction: requests: {[cid]: {
    result: cat,
    error: null,
  }}})

  const action = actions.error(cid, cat)

  const newState = updater(action)(initialState)
  t.ok(newState.feathersAction.requests[cid].completeTime)
  t.ok(newState.feathersAction.requests[cid].error)
  t.end()
})
