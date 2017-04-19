const Cuid = require('cuid')
const { combineEpics } = require('redux-observable')
const is = require('typeof-is')
const pipe = require('ramda/src/pipe')
// TODO split into individual modules
const Rx = require('rxjs/Rx')

const { DEFAULT_METHODS } = require('./constants')
const createActionTypes = require('./action-types')
const createActionCreators = require('./actions')

module.exports = createEpic

function createEpic (options) {
  const {
    service,
    methods = DEFAULT_METHODS,
    createCid = Cuid
  } = options

  const actionTypes = createActionTypes(options)
  const actionCreators = createActionCreators(options)

  const epic = combineEpics(
    create
  )

  return epic

  function create (action$, state, deps) {
    assertFeathersDep(deps)

    const { feathers } = deps

    return action$.ofType(actionTypes.create)
      .mergeMap(action => {
        const method = 'create'
        const args = action.payload
        const cid = createCid()
        const requestStart = actionCreators.requestStart(cid, {
          service,
          method,
          args
        })
        const requestStart$ = Rx.Observable.of(requestStart)

        return Rx.Observable.of(
          requestStart,
          feathers.create(args.data. args.params)
        )
          .concatAll()
      })
  }

  function callFeathersMethod (feathers, emit, options) {
  }
}

function assertFeathersDep (deps = {}) {
  if (is.undefined(deps.feathers)) {
    throw new Error('feathers-action/epic: expected feathers app or client to be given as dependency in redux-observable middleware')
  }
}
