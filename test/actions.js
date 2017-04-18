'use strict'

const test = require('tape')

const { all, has, __ } = require('ramda')

const createModule = require('../')
const createActionTypes = require('../action-types')

const cats = createModule('cats')
const actionTypes = createActionTypes({ service: 'cats' })

test('action creators have correct keys', function (t) {
  const keys = ['find', 'create', 'get', 'update', 'patch', 'remove', 'set', 'requestStart', 'requestSuccess', 'requestError']
  const hasActions = has(__, cats.actions)
  const hasAllActions = all(hasActions)
  t.true(hasAllActions(keys))
  t.end()
})

test('request start', function (t) {
  const expectedAction = {
    type: actionTypes.requestStart,
    payload: {
      service: 'cats',
      method: 'create',
      args: {
        data: {
          name: 'fluffy'
        }
      }
    },
    meta: {
      cid: 'abcd'
    }
  }

  const action = cats.actions.requestStart('abcd', {
    service: 'cats',
    method: 'create',
    args: {
      data: {
        name: 'fluffy'
      }
    }
  })

  t.deepEqual(action, expectedAction)
  t.end()
})

test('request success', function (t) {
  const result = {
    id: 1,
    name: 'fluffy'
  }
  const expectedAction = {
    type: actionTypes.requestSuccess,
    payload: result,
    meta: {
      cid: 'abcd'
    }
  }

  const action = cats.actions.requestSuccess('abcd', result)

  t.deepEqual(action, expectedAction)
  t.end()
})

test('request error', function (t) {
  const err = new Error('request failed, meow.')
  const expectedAction = {
    type: actionTypes.requestError,
    payload: err,
    error: true,
    meta: {
      cid: 'abcd'
    }
  }

  const action = cats.actions.requestError('abcd', err)

  t.deepEqual(action, expectedAction)
  t.end()
})

test('find returns the correct action', function (t) {
  const findAction = cats.actions.find({})
  const expectedAction = {
    type: actionTypes.find,
    payload: {
      params: {}
    }
  }
  t.deepEqual(findAction, expectedAction)
  t.end()
})

test('get returns the correct action', function (t) {
  const getAction = cats.actions.get(1)
  const expectedAction = {
    type: actionTypes.get,
    payload: {
      id: 1,
      params: {}
    }
  }
  t.deepEqual(getAction, expectedAction)
  t.end()
})

test('create returns the correct action', function (t) {
  const createAction = cats.actions.create({ name: 'fluffy' })
  const expectedAction = {
    type: actionTypes.create,
    payload: {
      data: {
        name: 'fluffy'
      },
      params: {}
    }
  }
  t.deepEqual(createAction, expectedAction)
  t.end()
})

test('update returns the correct action', function (t) {
  const updateAction = cats.actions.update(1, { id: 1, name: 'fluffy' })
  const expectedAction = {
    type: actionTypes.update,
    payload: {
      id: 1,
      data: {
        id: 1,
        name: 'fluffy'
      },
      params: {}
    }
  }
  t.deepEqual(updateAction, expectedAction)
  t.end()
})

test('patch returns the correct action', function (t) {
  const patchAction = cats.actions.patch(1, { name: 'fluffy' })
  const expectedAction = {
    type: actionTypes.patch,
    payload: {
      id: 1,
      data: {
        name: 'fluffy'
      },
      params: {}
    }
  }
  t.deepEqual(patchAction, expectedAction)
  t.end()
})

test('remove returns the correct action', function (t) {
  const removeAction = cats.actions.remove(1)
  const expectedAction = {
    type: actionTypes.remove,
    payload: {
      id: 1,
      params: {}
    }
  }
  t.deepEqual(removeAction, expectedAction)
  t.end()
})
