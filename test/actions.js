'use strict'

const test = require('tape')

const { all, has, __ } = require('ramda')

const createModule = require('../')
const createActionTypes = require('../action-types')

const cats = createModule({ service: 'cats', internal: true })
const actionTypes = createActionTypes({ service: 'cats', internal: true })

test('action creators have correct keys', function (t) {
  const keys = ['find', 'create', 'get', 'update', 'patch', 'remove', 'set', 'start', 'complete', 'error']
  const hasActions = has(__, cats.actions)
  const hasAllActions = all(hasActions)
  t.true(hasAllActions(keys))
  t.end()
})

test('request start', function (t) {
  const cid = 'abcd'
  const expectedAction = {
    type: actionTypes.start,
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
      cid
    }
  }

  const action = cats.actions.start(cid, {
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
  const cid = 'abcd'
  const result = {
    id: 1,
    name: 'fluffy'
  }
  const expectedAction = {
    type: actionTypes.complete,
    payload: result,
    meta: {
      cid
    }
  }

  const action = cats.actions.complete(cid, result)

  t.deepEqual(action, expectedAction)
  t.end()
})

test('request error', function (t) {
  const cid = 'abcd'
  const err = new Error('request failed, meow.')
  const expectedAction = {
    type: actionTypes.error,
    payload: err,
    meta: {
      cid
    }
  }

  const action = cats.actions.error(cid, err)

  t.deepEqual(action, expectedAction)
  t.end()
})

test('find returns the correct action', function (t) {
  const cid = 'abcd'
  const findAction = cats.actions.find(cid, {})
  const expectedAction = {
    type: actionTypes.find,
    payload: {
      params: {}
    },
    meta: {
      cid
    }
  }
  t.deepEqual(findAction, expectedAction)
  t.end()
})

test('get returns the correct action', function (t) {
  const cid = 'abcd'
  const getAction = cats.actions.get(cid, 1)
  const expectedAction = {
    type: actionTypes.get,
    payload: {
      id: 1,
      params: {}
    },
    meta: {
      cid
    }
  }
  t.deepEqual(getAction, expectedAction)
  t.end()
})

test('create returns the correct action', function (t) {
  const cid = 'abcd'
  const createAction = cats.actions.create(cid, { name: 'fluffy' })
  const expectedAction = {
    type: actionTypes.create,
    payload: {
      data: {
        name: 'fluffy'
      },
      params: {}
    },
    meta: {
      cid
    }
  }
  t.deepEqual(createAction, expectedAction)
  t.end()
})

test('update returns the correct action', function (t) {
  const cid = 'abcd'
  const updateAction = cats.actions.update(cid, 1, { id: 1, name: 'fluffy' })
  const expectedAction = {
    type: actionTypes.update,
    payload: {
      id: 1,
      data: {
        id: 1,
        name: 'fluffy'
      },
      params: {}
    },
    meta: {
      cid
    }
  }
  t.deepEqual(updateAction, expectedAction)
  t.end()
})

test('patch returns the correct action', function (t) {
  const cid = 'abcd'
  const patchAction = cats.actions.patch(cid, 1, { name: 'fluffy' })
  const expectedAction = {
    type: actionTypes.patch,
    payload: {
      id: 1,
      data: {
        name: 'fluffy'
      },
      params: {}
    },
    meta: {
      cid
    }
  }
  t.deepEqual(patchAction, expectedAction)
  t.end()
})

test('remove returns the correct action', function (t) {
  const cid = 'abcd'
  const removeAction = cats.actions.remove(cid, 1)
  const expectedAction = {
    type: actionTypes.remove,
    payload: {
      id: 1,
      params: {}
    },
    meta: {
      cid
    }
  }
  t.deepEqual(removeAction, expectedAction)
  t.end()
})
