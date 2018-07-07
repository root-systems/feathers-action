const test = require('tape')
const { Observable, of, throwError } = require('rxjs')
const {
  toArray
} = require('rxjs/operators')
const Action$ = require('redux-observable/lib/cjs/ActionsObservable').ActionsObservable
const { values, merge, mergeAll, propEq } = require('ramda')

const catsData = {
  0: { id: 0, name: 'honey', description: 'sweet and delicious.' },
  1: { id: 1, name: 'tea' },
  2: { id: 2, name: 'mug' }
}
const newCat = { name: 'honey', description: 'sweet and delicious' }
const nextCat = { name: 'sugar' }

const createActionCreators = require('../actions')
const createModule = require('../')

const service = 'cats'
const cats = createModule({ service })
const actionCreators = createActionCreators({ service })

var currentCid = 100
function createCid () {
  return currentCid++
}

test('find', function (t) {
  const cid = createCid()
  const action$ = Action$.of(cats.actions.find(cid))
  const feathers = {
    service: () => ({
      find: () => of(values(catsData))
    })
  }
  const expected = [
    actionCreators.start(cid, { service, method: 'find', args: { params: {} } }),
    // actionCreators.set(cid, 0, catsData[0]),
    // actionCreators.set(cid, 1, catsData[1]),
    // actionCreators.set(cid, 2, catsData[2]),
    actionCreators.setAll(cid, values(catsData)),
    actionCreators.ready(cid),
    actionCreators.complete(cid)
  ]
  cats.epic(action$, undefined, { feathers }).pipe(
    toArray() // .reduce(flip(append), [])
  ).subscribe((actions) => {
    t.deepEqual(actions, expected)
    t.end()
  })
})

test('find with cancel', function (t) {
  const cid = createCid()
  const action$ = new Action$(Observable.create(observer => {
    observer.next(cats.actions.find(cid))
    process.nextTick(() => {
      observer.next(cats.actions.complete(cid))
    })
  }))
  const feathers = {
    service: () => ({
      find: () => Observable.create(observer => {
        observer.next(values(catsData))
      })
    })
  }
  const expected = [
    actionCreators.start(cid, { service, method: 'find', args: { params: {} } }),
    // actionCreators.set(cid, 0, catsData[0]),
    // actionCreators.set(cid, 1, catsData[1]),
    // actionCreators.set(cid, 2, catsData[2])
    actionCreators.setAll(cid, values(catsData)),
    actionCreators.ready(cid)
  ]
  var i = 0
  cats.epic(action$, undefined, { feathers })
    .subscribe((action) => {
      t.deepEqual(action, expected[i++])
      if (i === 3) t.end()
    })
})

test('get', function (t) {
  const cid = createCid()
  const action$ = Action$.of(cats.actions.get(cid, 0))
  const feathers = {
    service: () => ({
      get: (id) => of(catsData[id])
    })
  }
  const expected = [
    actionCreators.start(cid, { service, method: 'get', args: { id: 0, params: {} } }),
    actionCreators.set(cid, 0, catsData[0]),
    actionCreators.ready(cid),
    actionCreators.complete(cid)
  ]
  cats.epic(action$, undefined, { feathers }).pipe(
    toArray()
  ).subscribe((actions) => {
    t.deepEqual(actions, expected)
    t.end()
  })
})

test('create', function (t) {
  const cid = createCid()
  const action$ = Action$.of(cats.actions.create(cid, newCat))
  const feathers = {
    service: () => ({
      create: () => of(catsData[0])
    })
  }
  const expected = [
    actionCreators.start(cid, { service, method: 'create', args: { data: newCat, params: {} } }),
    actionCreators.set(cid, cid, newCat),
    actionCreators.unset(cid, cid, undefined),
    actionCreators.set(cid, 0, catsData[0]),
    actionCreators.ready(cid),
    actionCreators.complete(cid)
  ]
  cats.epic(action$, undefined, { feathers }).pipe(
    toArray()
  ).subscribe((actions) => {
    t.deepEqual(actions, expected)
    t.end()
  })
})

test('create with rollback', function (t) {
  const cid = createCid()
  const err = new Error('oh no')
  const action$ = Action$.of(cats.actions.create(cid, newCat))
  const feathers = {
    service: () => ({
      create: () => throwError(err)
    })
  }
  const expected = [
    actionCreators.start(cid, { service, method: 'create', args: { data: newCat, params: {} } }),
    actionCreators.set(cid, cid, newCat),
    actionCreators.unset(cid, cid, undefined),
    actionCreators.error(cid, err)
  ]
  cats.epic(action$, undefined, { feathers }).pipe(
    toArray()
  ).subscribe((actions) => {
    t.deepEqual(actions, expected)
    t.end()
  })
})

test('update', function (t) {
  const cid = createCid()
  const action$ = Action$.of(cats.actions.update(cid, 0, nextCat))
  const feathers = {
    service: () => ({
      update: () => of(merge({ id: 0, feathers: true }, nextCat))
    })
  }
  const state$ = {
    value: { cats: catsData }
  }
  const expected = [
    actionCreators.start(cid, { service, method: 'update', args: { id: 0, data: nextCat, params: {} } }),
    actionCreators.set(cid, 0, merge({ id: 0 }, nextCat)),
    actionCreators.set(cid, 0, merge({ id: 0, feathers: true }, nextCat)),
    actionCreators.ready(cid),
    actionCreators.complete(cid)
  ]
  cats.epic(action$, state$, { feathers }).pipe(
    toArray()
  ).subscribe((actions) => {
    t.deepEqual(actions, expected)
    t.end()
  })
})

test('update with rollback', function (t) {
  const cid = createCid()
  const err = new Error('oh no')
  const action$ = Action$.of(cats.actions.update(cid, 0, nextCat))
  const feathers = {
    service: () => ({
      update: () => throwError(err)
    })
  }
  const state$ = {
    value: { cats: catsData }
  }
  const expected = [
    actionCreators.start(cid, { service, method: 'update', args: { id: 0, data: nextCat, params: {} } }),
    actionCreators.set(cid, 0, merge({ id: 0 }, nextCat)),
    actionCreators.set(cid, 0, catsData[0]),
    actionCreators.error(cid, err)
  ]
  cats.epic(action$, state$, { feathers }).pipe(
    toArray()
  ).subscribe((actions) => {
    t.deepEqual(actions, expected)
    t.end()
  })
})

test('patch', function (t) {
  const cid = createCid()
  const action$ = Action$.of(cats.actions.patch(cid, 0, nextCat))
  const feathers = {
    service: () => ({
      patch: () => of(mergeAll([catsData[0], { feathers: true }, nextCat]))
    })
  }
  const state$ = {
    value: { cats: catsData }
  }
  const expected = [
    actionCreators.start(cid, { service, method: 'patch', args: { id: 0, data: nextCat, params: {} } }),
    actionCreators.set(cid, 0, merge(catsData[0], nextCat)),
    actionCreators.set(cid, 0, mergeAll([catsData[0], { feathers: true }, nextCat])),
    actionCreators.ready(cid),
    actionCreators.complete(cid)
  ]
  cats.epic(action$, state$, { feathers }).pipe(
    toArray()
  ).subscribe((actions) => {
    t.deepEqual(actions, expected)
    t.end()
  })
})

test('patch with rollback', function (t) {
  const cid = createCid()
  const err = new Error('oh no')
  const action$ = Action$.of(cats.actions.patch(cid, 0, nextCat))
  const feathers = {
    service: () => ({
      patch: () => throwError(err)
    })
  }
  const state$ = {
    value: { cats: catsData }
  }
  const expected = [
    actionCreators.start(cid, { service, method: 'patch', args: { id: 0, data: nextCat, params: {} } }),
    actionCreators.set(cid, 0, merge(catsData[0], nextCat)),
    actionCreators.set(cid, 0, catsData[0]),
    actionCreators.error(cid, err)
  ]
  cats.epic(action$, state$, { feathers }).pipe(
    toArray()
  ).subscribe((actions) => {
    t.deepEqual(actions, expected)
    t.end()
  })
})

test('remove', function (t) {
  const cid = createCid()
  const action$ = Action$.of(cats.actions.remove(cid, 0))
  const feathers = {
    service: () => ({
      remove: () => of(catsData[0])
    })
  }
  const state$ = {
    value: { cats: catsData }
  }
  const expected = [
    actionCreators.start(cid, { service, method: 'remove', args: { id: 0, params: {} } }),
    actionCreators.unset(cid, 0, undefined),
    actionCreators.unset(cid, 0, undefined),
    actionCreators.ready(cid),
    actionCreators.complete(cid)
  ]
  cats.epic(action$, state$, { feathers }).pipe(
    toArray()
  ).subscribe((actions) => {
    t.deepEqual(actions, expected)
    t.end()
  })
})

test('remove with rollback', function (t) {
  const cid = createCid()
  const err = new Error('oh no')
  const action$ = Action$.of(cats.actions.remove(cid, 0))
  const feathers = {
    service: () => ({
      remove: () => throwError(err)
    })
  }
  const state$ = {
    value: { cats: catsData }
  }
  const expected = [
    actionCreators.start(cid, { service, method: 'remove', args: { id: 0, params: {} } }),
    actionCreators.unset(cid, 0, undefined),
    actionCreators.set(cid, 0, catsData[0]),
    actionCreators.error(cid, err)
  ]
  cats.epic(action$, state$, { feathers }).pipe(
    toArray()
  ).subscribe((actions) => {
    t.deepEqual(actions, expected)
    t.end()
  })
})

/*

test('create is handled by epic and calls create on the feathers', function (t) {
  const cat = { name: 'fluffy' }
  const action$ = Action$.of(cats.actions.create(cat))

  const feathers = {
    create: (data, params) => {
      t.deepEqual(data, cat)
      t.deepEqual(params, {})
      t.end()
    }
  }

  cats.epic(action$, {}, { feathers })
    .filter(isType(actionTypes.create))
    .subscribe((action) => {
    })
})

test('create is handled by epic and emits request start action', function (t) {
  const cat = { name: 'fluffy' }
  const action$ = Action$.of(cats.actions.create(cat))

  const feathers = {
    create: () => {
    }
  }

  cats.epic(action$, {}, { feathers })
    .filter(isType(actionTypes.start))
    .subscribe((action) => {
      t.ok(action)
      t.end()
    })
})

test('create is handled by epic and emits set action', function (t) {
  const cat = { name: 'fluffy' }
  const action$ = Action$.of(cats.actions.create(cat))

  const feathers = {
    create: () => {
    }
  }

  cats.epic(action$, {}, { feathers })
    .filter(({type}) => type === 'FEATHERS_CATS_SET')
    .subscribe((action) => {
      t.ok(action)
      t.end()
    })
})

test('create is handled by epic and emits set action twice when request succeeds', function (t) {
  const cat = { name: 'fluffy' }
  const action$ = Action$.of(cats.actions.create(cat))
  t.plan(2)

  const feathers = {
    create: (cat) => {
      return Promise.resolve(cat)
    }
  }
  cats.epic(action$, {}, { feathers })
    .filter(({type}) => type === 'FEATHERS_CATS_SET')
    .subscribe((action) => {
      t.ok(action)
    })
})

const isType = propEq('type')

*/
