const test = require('tape')

const createActionTypes = require('../action-types')

test('returns the service action ids', function (t) {
  const actionTypes = createActionTypes({ service: 'cats' })

  t.equal(actionTypes.find, 'FEATHERS_CATS_FIND')
  t.equal(actionTypes.get, 'FEATHERS_CATS_GET')
  t.equal(actionTypes.create, 'FEATHERS_CATS_CREATE')
  t.equal(actionTypes.update, 'FEATHERS_CATS_UPDATE')
  t.equal(actionTypes.patch, 'FEATHERS_CATS_PATCH')
  t.equal(actionTypes.remove, 'FEATHERS_CATS_REMOVE')

  t.equal(actionTypes.set, 'FEATHERS_CATS_SET')

  t.equal(actionTypes.requestStart, 'FEATHERS_CATS_REQUEST_START')
  t.equal(actionTypes.requestSuccess, 'FEATHERS_CATS_REQUEST_SUCCESS')
  t.equal(actionTypes.requestError, 'FEATHERS_CATS_REQUEST_ERROR')

  t.end()
})
