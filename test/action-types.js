const test = require('tape')
const { FEATHERS_ACTION } = require('../constants')

const createActionTypes = require('../action-types')

test('returns the action ids', function (t) {
  const actionTypes = createActionTypes({ service: 'cats' })

  t.equal(actionTypes.find, FEATHERS_ACTION)
  t.equal(actionTypes.get, FEATHERS_ACTION)
  t.equal(actionTypes.create, FEATHERS_ACTION)
  t.equal(actionTypes.update, FEATHERS_ACTION)
  t.equal(actionTypes.patch, FEATHERS_ACTION)
  t.equal(actionTypes.remove, FEATHERS_ACTION)

  t.equal(actionTypes.set, 'FEATHERS_CATS_SET')

  t.equal(actionTypes.requestStart, 'FEATHERS_REQUEST_START')
  t.equal(actionTypes.requestComplete, 'FEATHERS_REQUEST_COMPLETE')
  t.equal(actionTypes.requestError, 'FEATHERS_REQUEST_ERROR')

  t.end()
})
