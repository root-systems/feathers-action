'use strict'

const test = require('tape')
const feathersAction = require('../src/')

const apiKeyNames = ['actions, updater, epic']

test('feathersAction is a function', function(t) {
  t.equal(typeof featherAction, 'function')
  t.end()
})

test('feathersAction called with a string returns object with action, updater and epic keys', function(t) {
  const modules = feathersAction('cats')
  t.deepEqual(Object.keys(modules), apiKeyNames)
  t.end()
})

test('feathersAction called with a object returns object with action, updater and epic keys', function(t) {
  const modules = feathersAction({name:'cats'})
  t.deepEqual(Object.keys(modules), apiKeyNames)
  t.end()
})

test('feathersAction called with an array of strings returns object with keys that match the strings', function(t) {
  const modules = feathersAction(['cats', 'dogs'])
  t.deepEqual(Object.keys(modules.cats), apiKeyNames)
  t.deepEqual(Object.keys(modules.dogs), apiKeyNames)
  t.end()
})

test('feathersAction called with an array of objects returns object with keys that match the object names', function(t) {
  const modules = feathersAction({name:'cats'}, {name:'dogs'})
  t.deepEqual(Object.keys(modules.cats), apiKeyNames)
  t.deepEqual(Object.keys(modules.dogs), apiKeyNames)
  t.end()
})

test('throws if called with no args', function(t) {
  t.throws(() => feathersAction())
  t.end()
})
