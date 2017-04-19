const test = require('tape')
const Rx = require('rxjs/Rx')
const Action$ = require('redux-observable/lib/cjs/ActionsObservable').ActionsObservable
const { values, propEq } = require('ramda')

const catsData = {
  0: { id: 0, name: 'honey', description: 'sweet and delicious.' },
  1: { id: 1, name: 'tea' },
  2: { id: 2, name: 'mug' }
}

const createActionTypes = require('../action-types')
const createModule = require('../')
const cats = createModule('cats')
const actionTypes = createActionTypes({ service: 'cats' })

test('find action is handled by an epic and emits something', function (t) {
  t.plan(values(catsData).length + 1)
  const action$ = Action$.of(cats.actions.find())
  const feathers = {
    find: () => Rx.Observable.of(values(catsData))
  }
  cats.epic(action$, undefined, { feathers })
    .subscribe((action) => {
      t.ok(action)
    })
})

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
    .filter(isType(actionTypes.requestStart))
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
