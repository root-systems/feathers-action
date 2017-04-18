'use strict'

const test = require('tape')
const createModule = require('../')

const moduleKeyNames = ['name', 'actions', 'updater', 'epic']

test('feathersAction is a function', function (t) {
  t.equal(typeof createModule, 'function')
  t.end()
})

test('feathersAction.createModule called with a string returns object with action, updater and epic keys', function (t) {
  const module = createModule('cats')
  t.deepEqual(Object.keys(module), moduleKeyNames)
  t.end()
})

test('feathersAction called with a object returns object with action, updater and epic keys', function (t) {
  const module = createModule({service: 'cats'})
  t.deepEqual(Object.keys(module), moduleKeyNames)
  t.end()
})

test('feathersAction called with an array of strings returns object with keys that match the strings', function (t) {
  const modules = createModule(['cats', 'dogs'])
  t.deepEqual(Object.keys(modules.cats), moduleKeyNames)
  t.deepEqual(Object.keys(modules.dogs), moduleKeyNames)
  t.end()
})

test('feathersAction called with an array of objects returns object with keys that match the object names', function (t) {
  const modules = createModule([{service: 'cats'}, {service: 'dogs'}])
  t.deepEqual(Object.keys(modules.cats), moduleKeyNames)
  t.deepEqual(Object.keys(modules.dogs), moduleKeyNames)
  t.end()
})

test('throws if called with no args', function (t) {
  t.throws(() => createModule())
  t.end()
})
