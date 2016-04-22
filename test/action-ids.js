'use strict'

const test = require('tape')
const constants = require('../src/constants')
const FEATHERS_ACTION = constants.FEATHERS_ACTION
const Resource = require('./types').Resource
const createActionIds = require('../src/action-ids')
const createActionId = createActionIds.createActionId

test('returns the action ids', function (t) {
  const actionIds = createActionIds({ Resource })

  t.equal(actionIds.find.call, FEATHERS_ACTION)
  t.equal(actionIds.find.start, 'THINGS_FIND_START')
  t.equal(actionIds.find.success, 'THINGS_FIND_SUCCESS')
  t.equal(actionIds.find.error, 'THINGS_FIND_ERROR')

  t.equal(actionIds.get.call, FEATHERS_ACTION)
  t.equal(actionIds.get.start, 'THINGS_GET_START')
  t.equal(actionIds.get.success, 'THINGS_GET_SUCCESS')
  t.equal(actionIds.get.error, 'THINGS_GET_ERROR')

  t.equal(actionIds.create.call, FEATHERS_ACTION)
  t.equal(actionIds.create.start, 'THINGS_CREATE_START')
  t.equal(actionIds.create.success, 'THINGS_CREATE_SUCCESS')
  t.equal(actionIds.create.error, 'THINGS_CREATE_ERROR')

  t.equal(actionIds.update.call, FEATHERS_ACTION)
  t.equal(actionIds.update.start, 'THINGS_UPDATE_START')
  t.equal(actionIds.update.success, 'THINGS_UPDATE_SUCCESS')
  t.equal(actionIds.update.error, 'THINGS_UPDATE_ERROR')

  t.equal(actionIds.patch.call, FEATHERS_ACTION)
  t.equal(actionIds.patch.start, 'THINGS_PATCH_START')
  t.equal(actionIds.patch.success, 'THINGS_PATCH_SUCCESS')
  t.equal(actionIds.patch.error, 'THINGS_PATCH_ERROR')

  t.equal(actionIds.remove.call, FEATHERS_ACTION)
  t.equal(actionIds.remove.start, 'THINGS_REMOVE_START')
  t.equal(actionIds.remove.success, 'THINGS_REMOVE_SUCCESS')
  t.equal(actionIds.remove.error, 'THINGS_REMOVE_ERROR')

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
