const test = require('tape')
const Rx = require('rxjs/Rx')

const feathersAction = require('../')
const cats = feathersAction('cats')

test('FEATHERS_ACTION is handled by epic and emits something', function(t) {
  const { action, epics } = cats.actions.create({name: 'fluffy'})
  const action$ = Rx.Observable.of(action)

  epics(action$)  
    .subscribe(() => {
      t.pass() 
      t.end()
    })
})
