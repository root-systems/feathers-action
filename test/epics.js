const test = require('tape')
const Rx = require('rxjs/Rx')

const feathersAction = require('../')
const cats = feathersAction('cats')

test('FEATHERS_ACTION is handled by epic and emits something', function(t) {
  const { action, epics } = cats.actions.create({name: 'fluffy'})
  const action$ = Rx.Observable.of(action)

  epics(action$)  
    .subscribe((action) => {
      t.ok(action) 
      t.end()
    })
})

test('create is handled by epic and calls create on the client', function(t) {
  const { action, epics } = cats.actions.create({name: 'fluffy'})
  const action$ = Rx.Observable.of(action)

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
  const { action, epics } = cats.actions.create({name: 'fluffy'})
  const action$ = Rx.Observable.of(action)

  const client = {
    create: () => {
    } 
  }

  epics(action$, {}, client)  
    .filter({type} => type === 'FEATHERS_REQUEST_START' )
    .subscribe((action) => {
      t.ok(action)
      t.end()
    })
})

test('create is handled by epic and emits set action', function(t) {
  const { action, epics } = cats.actions.create({name: 'fluffy'})
  const action$ = Rx.Observable.of(action)

  const client = {
    create: () => {
    } 
  }

  epics(action$, {}, client)  
    .filter({type} => type === 'FEATHERS_CATS_SET' )
    .subscribe((action) => {
      t.ok(action)
      t.end()
    })
})

test('create is handled by epic and emits set action', function(t) {
  const { action, epics } = cats.actions.create({name: 'fluffy'})
  const action$ = Rx.Observable.of(action)

  const client = {
    create: (cat) => {
      return Promise.resolve(cat)
    } 
  }
  //TODO: collect up the actions?
  epics(action$, {}, client)
    .filter({type} => type === 'FEATHERS_CATS_SET' )
    .subscribe((action) => {
      t.ok(action)
      t.end()
    })
})
