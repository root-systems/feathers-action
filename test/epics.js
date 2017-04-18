const test = require('tape')
const Rx = require('rxjs/Rx')

const createActionTypes = require('../action-types')
const createModule = require('../')
const cats = createModule('cats')
const actionTypes = createActionTypes({ service: 'cats' })
const epics = require('../epics')


test('create action is handled by an epic and emits something', function(t) {
  const action$ = Rx.Observable.of(actionTypes.update)

  epics(action$)  
    .subscribe((action) => {
      t.ok(action) 
      t.end()
    })
})

test('create is handled by epic and calls create on the client', function(t) {

  const action$ = Rx.Observable.of(actionTypes.update)

  const client = {
    create: () => {
      t.pass()
      t.end()
    } 
  }

  epics(action$, {}, client)  
    .subscribe((action) => {
    })
})

test('create is handled by epic and emits request start action', function(t) {
  const action$ = Rx.Observable.of(actionTypes.update)

  const client = {
    create: () => {
    } 
  }

  epics(action$, {}, client)  
    .filter(({type}) => type === 'FEATHERS_CATS_REQUEST_START' )
    .subscribe((action) => {
      t.ok(action)
      t.end()
    })
})

test('create is handled by epic and emits set action', function(t) {
  const action$ = Rx.Observable.of(actionTypes.update)

  const client = {
    create: () => {
    } 
  }

  epics(action$, {}, client)  
    .filter(({type}) => type === 'FEATHERS_CATS_SET' )
    .subscribe((action) => {
      t.ok(action)
      t.end()
    })
})

test('create is handled by epic and emits set action twice when request succeeds', function(t) {
  t.plan(2)
  const action$ = Rx.Observable.of(actionTypes.update)

  const client = {
    create: (cat) => {
      return Promise.resolve(cat)
    } 
  }
  epics(action$, {}, client)
    .filter(({type}) => type === 'FEATHERS_CATS_SET' )
    .subscribe((action) => {
      t.ok(action)
    })
})
