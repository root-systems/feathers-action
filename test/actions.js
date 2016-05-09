'use strict'

const test = require('tape')
const Tc = require('tcomb')
const createCid = require('cuid')

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
  t.deepEqual(
    actions.find({ query }),
    {
      type: FEATHERS_ACTION,
      payload: {
        service: undefined,
        serviceName: 'things',
        method: 'find',
        args: [{ query }]
      }
    }
  )

  t.deepEqual(
    actions.find.call({ query }),
    actions.find({ query })
  )

  const cid = createCid()

  t.deepEqual(
    actions.find.start(cid, {
      params: { query }
    }),
    {
      type: 'THINGS_FIND_START',
      payload: {
        params: { query }
      },
      meta: { cid },
    }
  )

  const successResult = [
    { id: 1, name: 'human' },
    { id: 2, name: 'computer' },
  ]
  t.deepEqual(
    actions.find.success(cid, successResult),
    {
      type: 'THINGS_FIND_SUCCESS',
      payload: successResult,
      meta: { cid },
    }
  )

  const error = new Error('failure to communicate.')
  t.deepEqual(
    actions.find.error(cid, error),
    {
      type: 'THINGS_FIND_ERROR',
      payload: error,
      error: true,
      meta: { cid },
    }
  )

  t.end()
})
