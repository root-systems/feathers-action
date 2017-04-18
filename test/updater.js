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
  const { actions, update } = cats 
  const expectedState = Object.assign({}, defaultState, {cats: {0: cat}})
  const action = actions.set(0, cat)

  const newState = updater(action)(state)
  t.deepEqual(newState, expectedState)
})


test('start', function (t) {
  const { actions, update } = cats 
  const request = {
    method: 'create'
    args: {
    
    }
  }
  //not sure about the api of start action here.
  const action = actions.start(request)

  const newState = updater(action)(state)
  t.ok(newState.requests[action.cid])
  t.end()
})

test('complete', function (t) {

})

test('error', function (t) {

})
