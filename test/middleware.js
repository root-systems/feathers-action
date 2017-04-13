'use strict'

const test = require('tape')

const feathersAction = require('../src/')

test('feathersAction.middleware is a function', function(t) {
  t.equal(typeof feathersAction.middleware, 'function')
  t.end()
})

test('featherAction.middleware returns middleware', function(t) {
  const client = {}
  const middlware = feathersAction.middleware(client)
  t.ok(middleware)
  t.end()
})

test('middleware throws if not passed the client', function(t) {
  t.throws(() => feathersAction.middleware()) 
  t.end()
})
