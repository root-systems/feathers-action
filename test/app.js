var test = require('tape')
var feathers = require('@feathersjs/feathers')
var memory = require('feathers-memory')
var {createStore, applyMiddleware} = require('redux')
var { createEpicMiddleware, combineEpics } = require('redux-observable')
var feathersReactive = require('feathers-reactive')
var rxjs = require('rxjs')
var { mergeMap, take, filter: rxFilter } = require('rxjs/operators')
var reduxFp = require('redux-fp')
var Cid = require('cuid')

var createModule = require('../')

const serviceNames = ['cats', 'dogs']

test('app works', function (t) {
  const app = createApp(serviceNames)
  const {cats, dogs} = createModule(serviceNames)
  const catActions = cats.actions

  const updaters = reduxFp.combine({cats: cats.updater, dogs: dogs.updater})
  const epics = combineEpics(cats.epic, dogs.epic)

  const reducer = (state, action) => updaters(action)(state)

  const epicMiddleware = createEpicMiddleware({dependencies: {feathers: app}})

  const store = createStore(reducer, applyMiddleware(epicMiddleware))

  epicMiddleware.run(epics)

  const cidCreate = Cid()
  const cidUpdate = Cid()
  const cidPatch = Cid()
  const cidRemove = Cid()

  Store$(store).pipe(
    rxFilter((store) => store.cats && store.cats.cats[0]),
    take(1),
    mergeMap(({cats}) => {
      t.equal(cats.cats[0].name, 'fluffy')
      store.dispatch(catActions.update(cidUpdate, 0, {name: 'tick'}))
      return Store$(store)
    }),
    rxFilter((store) => store.cats && store.cats.cats[0] && store.cats.cats[0].name === 'tick'),
    take(1),
    mergeMap(({cats}) => {
      t.equal(cats.cats[0].name, 'tick')
      store.dispatch(catActions.patch(cidPatch, 0, {nickName: 'fatboy'}))
      return Store$(store)
    }),
    rxFilter((store) => store.cats && store.cats.cats[0] && store.cats.cats[0].nickName === 'fatboy'),
    take(1),
    mergeMap(({cats}) => {
      t.equal(cats.cats[0].nickName, 'fatboy')
      store.dispatch(catActions.remove(cidRemove, 0))
      return Store$(store)
    }),
    rxFilter((store) => store.cats && !store.cats.cats[0]),
    take(1)
  ).subscribe(() => {
    t.pass()
    t.end()
  })

  store.dispatch(cats.actions.create(cidCreate, {name: 'fluffy'}))
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
  app.configure(feathersReactive({ idField: 'id' }))
  resources.forEach(resource => {
    app.use('/' + resource, memory())
  })
  return app
}
