var test = require('tape')
var feathers = require('feathers')
var memory = require('feathers-memory')
var {createStore, applyMiddleware} = require('redux')
var { createEpicMiddleware, combineEpics } = require('redux-observable')
var feathersReactive = require('feathers-reactive')
var rxjs = require('rxjs')
var reduxFp = require('redux-fp')
var Cid = require('cuid')

var createModule = require('../')

const serviceNames = ['cats', 'dogs']


test('create, update, patch and remove update the store', function(t) {
  const app = createApp(serviceNames)
  const {cats, dogs} = createModule(serviceNames)
  const catActions = cats.actions

  const updaters = reduxFp.combine({cats: cats.updater, dogs: dogs.updater})
  const epics = combineEpics(cats.epic, dogs.epic)

  const reducer = (state, action) => updaters(action)(state)

  const epicMiddleware = createEpicMiddleware(epics, {dependencies: {feathers: app}})

  const store = createStore(reducer, applyMiddleware(epicMiddleware))

  
  Store$(store) 
    .filter((store) => store.cats.cats[0])
    .take(1)
    .mergeMap(({cats}) => {
      t.equal(cats.cats[0].name, 'fluffy') 
      store.dispatch(catActions.update(Cid(), 0,  {name: 'tick'}))
      return Store$(store)
    })
    .filter((store) => store.cats.cats[0].name === 'tick')
    .take(1)
    .mergeMap(({cats}) => {
      t.equal(cats.cats[0].name, 'tick') 
      store.dispatch(catActions.patch(Cid(), 0,  {nickName: 'fatboy'}))
      return Store$(store)
    })
    .filter((store) => store.cats.cats[0] && store.cats.cats[0].nickName === 'fatboy')
    .take(1)
    .mergeMap(({cats}) => {
      t.equal(cats.cats[0].nickName, 'fatboy') 
      store.dispatch(catActions.remove(Cid(), 0))
      return Store$(store)
    })
    .filter((store) => !store.cats.cats[0] )
    .take(1)
    .subscribe(() => {
      t.pass()
      t.end()
    })

  store.dispatch(cats.actions.create(Cid(), {name: 'fluffy'}))

})

function Store$ (store) {
  return rxjs.Observable.create(observer => {
    store.subscribe(() => {
      observer.next(store.getState())
    })
  })
}

function createApp (resources) {
  const app = feathers()
  app.configure(feathersReactive(rxjs))
  resources.forEach(resource => {
    app.use('/' + resource, memory())
  })
  return app
}
