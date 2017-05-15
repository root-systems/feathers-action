const test = require('tape')

const createActionTypes = require('../action-types')

test('returns the service action ids', function (t) {
  const actionTypes = createActionTypes({ service: 'cats', internal: true })

  t.equal(actionTypes.find, 'FEATHERS_CATS_FIND')
  t.equal(actionTypes.get, 'FEATHERS_CATS_GET')
  t.equal(actionTypes.create, 'FEATHERS_CATS_CREATE')
  t.equal(actionTypes.update, 'FEATHERS_CATS_UPDATE')
  t.equal(actionTypes.patch, 'FEATHERS_CATS_PATCH')
  t.equal(actionTypes.remove, 'FEATHERS_CATS_REMOVE')

  t.equal(actionTypes.set, 'FEATHERS_CATS_SET')

  t.equal(actionTypes.start, 'FEATHERS_CATS_START')
  t.equal(actionTypes.complete, 'FEATHERS_CATS_COMPLETE')
  t.equal(actionTypes.error, 'FEATHERS_CATS_ERROR')

  t.end()
})
