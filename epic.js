const { combineEpics } = require('redux-observable')
const is = require('typeof-is')
const map = require('ramda/src/map')
const contains = require('ramda/src/contains')
const __ = require('ramda/src/__')
const mapObjIndexed = require('ramda/src/mapObjIndexed')
const values = require('ramda/src/values')
const pathEq = require('ramda/src/pathEq')
const propEq = require('ramda/src/propEq')
// TODO split into individual modules
const Rx = require('rxjs/Rx')

const createActionTypes = require('./action-types')
const createActionCreators = require('./actions')

module.exports = createEpic

function createEpic (options) {
  const {
    service,
  } = options

  const actionTypes = createActionTypes(options)
  const actionCreators = createActionCreators(options)

  const epics = createEpics({ actionTypes, actionCreators, service })
  return combineEpics(...values(epics))
}

const requestArgs = {
  find: ({ params }) => [params],
  get: ({ id, params }) => [id, params],
  create: ({ data, params }) => [data, params],
  update: ({ id, data, params }) => [id, data, params],
  patch: ({ id, data, params }) => [id, data, params],
  remove: ({ id, params }) => [id, params]
}

const createRequestHandlers = actions => {
  const setAll = cid => map(value => actions.set(cid, value.id, value))

  return {
    find: (response$, cid) => response$
      .map(values => Rx.Observable.of(...setAll(cid)(values)))
      .concatAll(),
    get: (response$, cid) => response$
      .map(value => actions.set(cid, value.id, value)),
    create: (response$, cid, args) => {
      const optimistic = actions.set(cid, cid, args.data)
      const optimistic$ = Rx.Observable.of(optimistic)
      const removeOptimistic = actions.set(cid, cid, undefined)

      // TODO rollback
      var isOptimistic = true
      const responseAction$ = response$
        .map(value => {
          var stream = Rx.Observable.of(actions.set(cid, value.id, value))

          if (isOptimistic) {
            stream = Rx.Observable.of(removeOptimistic)
              .concat(stream)
            isOptimistic = false
          }
          return stream
        })
        .concatAll()

      return optimistic$.concat(responseAction$)
    },
    update: () => {},
    patch: () => {},
    remove: () => {}
  }
}

const createEpics = ({ actionTypes, actionCreators, service }) => {
  const requestHandlers = createRequestHandlers(actionCreators)
  const mapRequestHandlers = mapObjIndexed((requestHandler, method) => {
    return (action$, state, deps) => {
      assertFeathersDep(deps)

      const { feathers } = deps

      const requester = createRequester({ method, feathers })

      return action$.ofType(actionTypes[method])
        .mergeMap(action => {
          const args = action.payload
          const { cid } = action.meta

          var response$ = requester(args)
          if (isSingleRequest(method)) {
            response$ = response$.take(1)
          }
          const requestAction$ = requestHandler(response$, cid, args)

          const cancelAction$ = action$
            .filter(isCid(cid))
            .filter(isType(actionTypes.complete))

          return Rx.Observable.of(actionCreators.start(cid, { service, method, args }))
            .concat(requestAction$)
            .catch(err => Rx.Observable.of(actionCreators.error(cid, err)))
            .concat(Rx.Observable.of(actionCreators.complete(cid)))
            .takeUntil(cancelAction$)
        })
    }
  })
  return mapRequestHandlers(requestHandlers)
}

const createRequester = ({ feathers, method }) => {
  return payload => {
    const args = requestArgs[method](payload)
    return feathers[method](...args)
  }
}

function assertFeathersDep (deps = {}) {
  if (is.undefined(deps.feathers)) {
    throw new Error('feathers-action/epic: expected feathers app or client to be given as dependency in redux-observable middleware')
  }
}

const isSingleRequest = contains(__, [
  'create',
  'update',
  'patch',
  'remove'
])

const isCid = pathEq(['meta', 'cid'])
const isType = propEq('type')
