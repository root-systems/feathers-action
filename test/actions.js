'use strict'

const test = require('tape')
const Tc = require('tcomb')

const createActions = require('../src/actions')
const FEATHERS_ACTION = require('../src/constants').FEATHERS_ACTION

test('creates actions', function (t) {
  const Thing = Tc.struct({
    id: Tc.maybe(Tc.Number),
    name: Tc.String
  }, 'Thing')
  const Things = Tc.list(Thing, 'Things')
  const actions = createActions({ resource: Things })

  const query = { id: { $in: [0, 1, 2] } }
  t.deepEqual(actions.find({ query }), {
    type: FEATHERS_ACTION,
    payload: {
      service: 'things',
      method: 'find',
      params: { query }
    }
  })

  t.deepEqual(actions.findStart({ query }), {
    type: FEATHERS_ACTION,
    payload: {
      service: 'things',
      method: 'find',
      params: { query }
    }
  })

  t.end()
})
