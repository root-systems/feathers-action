'use strict'

const test = require('tape')
const createActionIds = require('../src/action-ids')
const createActionId = createActionIds.createActionId

const Resource = require('./types').Resource

test('returns the action names', function (t) {
  const names = createActionIds({ Resource })

  t.equal(names.THINGS_FIND_START, 'THINGS_FIND_START')
  t.equal(names.THINGS_FIND_SUCCESS, 'THINGS_FIND_SUCCESS')
  t.equal(names.THINGS_FIND_ERROR, 'THINGS_FIND_ERROR')

  t.equal(names.THINGS_GET_START, 'THINGS_GET_START')
  t.equal(names.THINGS_GET_SUCCESS, 'THINGS_GET_SUCCESS')
  t.equal(names.THINGS_GET_ERROR, 'THINGS_GET_ERROR')

  t.equal(names.THINGS_CREATE_START, 'THINGS_CREATE_START')
  t.equal(names.THINGS_CREATE_SUCCESS, 'THINGS_CREATE_SUCCESS')
  t.equal(names.THINGS_CREATE_ERROR, 'THINGS_CREATE_ERROR')

  t.equal(names.THINGS_UPDATE_START, 'THINGS_UPDATE_START')
  t.equal(names.THINGS_UPDATE_SUCCESS, 'THINGS_UPDATE_SUCCESS')
  t.equal(names.THINGS_UPDATE_ERROR, 'THINGS_UPDATE_ERROR')

  t.equal(names.THINGS_PATCH_START, 'THINGS_PATCH_START')
  t.equal(names.THINGS_PATCH_SUCCESS, 'THINGS_PATCH_SUCCESS')
  t.equal(names.THINGS_PATCH_ERROR, 'THINGS_PATCH_ERROR')

  t.equal(names.THINGS_REMOVE_START, 'THINGS_REMOVE_START')
  t.equal(names.THINGS_REMOVE_SUCCESS, 'THINGS_REMOVE_SUCCESS')
  t.equal(names.THINGS_REMOVE_ERROR, 'THINGS_REMOVE_ERROR')

  t.end()
})

test('returns aliases', function (t) {
  const names = createActionIds({ Resource })

  t.equal(names.findStart, 'THINGS_FIND_START')
  t.equal(names.findSuccess, 'THINGS_FIND_SUCCESS')
  t.equal(names.findError, 'THINGS_FIND_ERROR')

  t.equal(names.getStart, 'THINGS_GET_START')
  t.equal(names.getSuccess, 'THINGS_GET_SUCCESS')
  t.equal(names.getError, 'THINGS_GET_ERROR')

  t.equal(names.createStart, 'THINGS_CREATE_START')
  t.equal(names.createSuccess, 'THINGS_CREATE_SUCCESS')
  t.equal(names.createError, 'THINGS_CREATE_ERROR')

  t.equal(names.updateStart, 'THINGS_UPDATE_START')
  t.equal(names.updateSuccess, 'THINGS_UPDATE_SUCCESS')
  t.equal(names.updateError, 'THINGS_UPDATE_ERROR')

  t.equal(names.patchStart, 'THINGS_PATCH_START')
  t.equal(names.patchSuccess, 'THINGS_PATCH_SUCCESS')
  t.equal(names.patchError, 'THINGS_PATCH_ERROR')

  t.equal(names.removeStart, 'THINGS_REMOVE_START')
  t.equal(names.removeSuccess, 'THINGS_REMOVE_SUCCESS')
  t.equal(names.removeError, 'THINGS_REMOVE_ERROR')

  t.end()
})

test('it handles different cases', function (t) {
  ;[
    'SuperThings',
    'super-things',
    'super_things',
    'super things'
  ].forEach(function (name) {
    t.equal(
      createActionId(name, 'find', 'start'),
      'SUPER_THINGS_FIND_START'
    )
  })
  t.end()
})
