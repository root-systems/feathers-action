'use strict'

const test = require('tape')

const createMiddleware = require('../src/middleware')

test('createMiddleware', function(t) {
  t.ok(createMiddleware, 'module is require-able')
  t.end()
})
