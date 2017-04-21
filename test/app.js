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


test('app works', function(t) {
  const app = createApp(serviceNames)
  const {cats, dogs} = createModule(serviceNames)

  const updaters = reduxFp.combine({cats: cats.updater, dogs: dogs.updater}) 
  const epics = combineEpics(cats.epic, dogs.epic)

  const reducer = (state, action) => updaters(action)(state)

  const epicMiddleware = createEpicMiddleware(epics, {dependencies: {feathers: app}})

  const store = createStore(reducer, applyMiddleware(epicMiddleware))

  const cidCreate = Cid()
  
  store$ = rxjs.Observable.create(observer => {
    store.subscribe(() => {
      observer.next(store.getState()) 
    }) 
  }) 

  store$
    .filter((store) => store.cats && store.cats.cats[0])
    .take(1)
    .subscribe(({cats}) => {
      t.equal(cats.cats[0].name, 'fluffy') 
      t.end()
    })

  store.dispatch(cats.actions.create(cidCreate, {name: 'fluffy'}))

})

function createApp(resources) {
  const app = feathers()
  app.configure(feathersReactive(rxjs))
  resources.forEach(resource => {
    app.use('/' + resource, memory())
  }) 
  return app
}
