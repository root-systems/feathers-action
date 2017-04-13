'use strict'

const test = require('tape')
const deepFreeze = require('deep-freeze')

const feathersAction = require('../src/')
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

test('find', function (t) {
})

test('get', function (t) {
})

test('create', function (t) {
})

test('update', function (t) {
})

test('patch', function (t) {
})

test('remove', function (t) {
  const { actions, update } = cats 
  const state = Object.assign({}, defaultState, {cats: {[cat.id]: cat} })
  deepFreeze(state)
  const action = actions.remove({ id: cat.id })

  const newState = updater(action)(state)

  t.deepEqual(newState.cats, {})
  t.ok(newState.requests)
  t.end()
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
