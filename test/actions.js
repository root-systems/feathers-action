'use strict'

const test = require('tape')
const Tc = require('tcomb')
const cuid = require('cuid')

const createActions = require('../src/actions')
const FEATHERS_ACTION = require('../src/constants').FEATHERS_ACTION

test('creates actions', function (t) {
  const Thing = Tc.struct({
    id: Tc.maybe(Tc.Number),
    name: Tc.String
  }, 'Thing')
  const Things = Tc.list(Thing, 'Things')
  const actions = createActions({ Resource: Things })

  const query = { id: { $in: [0, 1, 2] } }
  t.deepEqual(actions.find({ query }), {
    type: FEATHERS_ACTION,
    payload: {
      service: 'things',
      method: 'find',
      params: { query }
    }
  })

  t.deepEqual(actions.find.call({
    params: { query } }
  ), {
    type: FEATHERS_ACTION,
    payload: {
      service: 'things',
      method: 'find',
      params: { query }
    }
  })

  const startCid = cuid()
  t.deepEqual(
    actions.find.start(startCid, {
      params: { query }
    }),
    {
      type: 'THINGS_FIND_START',
      payload: {
        params: { query }
      },
      meta: { cid: startCid },
    }
  )

  const successCid = cuid()
  const successResult = [
    Thing({ id: 1, name: 'human' }),
    Thing({ id: 2, name: 'computer' }),
  ]
  t.deepEqual(
    actions.find.success(successCid, successResult),
    {
      type: 'THINGS_FIND_SUCCESS',
      payload: successResult,
      meta: { cid: successCid },
    }
  )

  t.end()
})
