'use strict'

const test = require('tape')
const { createService } = require('../')

const serviceModuleKeyNames = ['name', 'actions', 'updater', 'epic']

test('feathersAction.createService is a function', function (t) {
  t.equal(typeof createService, 'function')
  t.end()
})

test('feathersAction.createService called with a string returns object with action, updater and epic keys', function (t) {
  const modules = createService('cats')
  t.deepEqual(Object.keys(modules), serviceModuleKeyNames)
  t.end()
})

test('feathersAction called with a object returns object with action, updater and epic keys', function (t) {
  const modules = createService({service: 'cats'})
  t.deepEqual(Object.keys(modules), serviceModuleKeyNames)
  t.end()
})

test('feathersAction called with an array of strings returns object with keys that match the strings', function (t) {
  const modules = createService(['cats', 'dogs'])
  t.deepEqual(Object.keys(modules.cats), serviceModuleKeyNames)
  t.deepEqual(Object.keys(modules.dogs), serviceModuleKeyNames)
  t.end()
})

test('feathersAction called with an array of objects returns object with keys that match the object names', function (t) {
  const modules = createService([{service: 'cats'}, {service: 'dogs'}])
  t.deepEqual(Object.keys(modules.cats), serviceModuleKeyNames)
  t.deepEqual(Object.keys(modules.dogs), serviceModuleKeyNames)
  t.end()
})

test('throws if called with no args', function (t) {
  t.throws(() => createService())
  t.end()
})
