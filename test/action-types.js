'use strict'

const test = require('tape')
const createActionTypes = require('../src/action-types')

test('returns the action names', function (t) {
  const names = createActionTypes('users')

  t.equal(names.USERS_FIND_START, 'USERS_FIND_START')
  t.equal(names.USERS_FIND_SUCCESS, 'USERS_FIND_SUCCESS')
  t.equal(names.USERS_FIND_ERROR, 'USERS_FIND_ERROR')

  t.equal(names.USERS_GET_START, 'USERS_GET_START')
  t.equal(names.USERS_GET_SUCCESS, 'USERS_GET_SUCCESS')
  t.equal(names.USERS_GET_ERROR, 'USERS_GET_ERROR')

  t.equal(names.USERS_CREATE_START, 'USERS_CREATE_START')
  t.equal(names.USERS_CREATE_SUCCESS, 'USERS_CREATE_SUCCESS')
  t.equal(names.USERS_CREATE_ERROR, 'USERS_CREATE_ERROR')

  t.equal(names.USERS_UPDATE_START, 'USERS_UPDATE_START')
  t.equal(names.USERS_UPDATE_SUCCESS, 'USERS_UPDATE_SUCCESS')
  t.equal(names.USERS_UPDATE_ERROR, 'USERS_UPDATE_ERROR')

  t.equal(names.USERS_PATCH_START, 'USERS_PATCH_START')
  t.equal(names.USERS_PATCH_SUCCESS, 'USERS_PATCH_SUCCESS')
  t.equal(names.USERS_PATCH_ERROR, 'USERS_PATCH_ERROR')

  t.equal(names.USERS_REMOVE_START, 'USERS_REMOVE_START')
  t.equal(names.USERS_REMOVE_SUCCESS, 'USERS_REMOVE_SUCCESS')
  t.equal(names.USERS_REMOVE_ERROR, 'USERS_REMOVE_ERROR')

  t.end()
})

test('returns aliases', function (t) {
  const names = createActionTypes('users')

  t.equal(names.findStart, 'USERS_FIND_START')
  t.equal(names.findSuccess, 'USERS_FIND_SUCCESS')
  t.equal(names.findError, 'USERS_FIND_ERROR')

  t.equal(names.getStart, 'USERS_GET_START')
  t.equal(names.getSuccess, 'USERS_GET_SUCCESS')
  t.equal(names.getError, 'USERS_GET_ERROR')

  t.equal(names.createStart, 'USERS_CREATE_START')
  t.equal(names.createSuccess, 'USERS_CREATE_SUCCESS')
  t.equal(names.createError, 'USERS_CREATE_ERROR')

  t.equal(names.updateStart, 'USERS_UPDATE_START')
  t.equal(names.updateSuccess, 'USERS_UPDATE_SUCCESS')
  t.equal(names.updateError, 'USERS_UPDATE_ERROR')

  t.equal(names.patchStart, 'USERS_PATCH_START')
  t.equal(names.patchSuccess, 'USERS_PATCH_SUCCESS')
  t.equal(names.patchError, 'USERS_PATCH_ERROR')

  t.equal(names.removeStart, 'USERS_REMOVE_START')
  t.equal(names.removeSuccess, 'USERS_REMOVE_SUCCESS')
  t.equal(names.removeError, 'USERS_REMOVE_ERROR')

  t.end()
})

test('it handles different cases', function (t) {
  let names

  names = createActionTypes('superUsers')
  t.equal(names.findStart, 'SUPER_USERS_FIND_START')

  names = createActionTypes('super-users')
  t.equal(names.findStart, 'SUPER_USERS_FIND_START')

  names = createActionTypes('super_users')
  t.equal(names.findStart, 'SUPER_USERS_FIND_START')

  names = createActionTypes('super users')
  t.equal(names.findStart, 'SUPER_USERS_FIND_START')

  t.end()
})
