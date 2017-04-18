const test = require('tape')
const { FEATHERS_ACTION } = require('../constants')

const createActionTypes = require('../action-types')

test('returns the service action ids', function (t) {
  const actionTypes = createActionTypes.service({ service: 'cats' })

  t.equal(actionTypes.find, FEATHERS_ACTION)
  t.equal(actionTypes.get, FEATHERS_ACTION)
  t.equal(actionTypes.create, FEATHERS_ACTION)
  t.equal(actionTypes.update, FEATHERS_ACTION)
  t.equal(actionTypes.patch, FEATHERS_ACTION)
  t.equal(actionTypes.remove, FEATHERS_ACTION)

  t.equal(actionTypes.set, 'FEATHERS_CATS_SET')

  t.end()
})

test('returns the request action ids', function (t) {
  const actionTypes = createActionTypes.request()

  t.equal(actionTypes.start, 'FEATHERS_REQUEST_START')
  t.equal(actionTypes.complete, 'FEATHERS_REQUEST_COMPLETE')
  t.equal(actionTypes.error, 'FEATHERS_REQUEST_ERROR')

  t.end()
})
