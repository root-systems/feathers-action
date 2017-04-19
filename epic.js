const Cuid = require('cuid')
const { combineEpics } = require('redux-observable')
const is = require('typeof-is')
const map = require('ramda/src/map')
const mapObjIndexed = require('ramda/src/mapObjIndexed')
const values = require('ramda/src/values')
// TODO split into individual modules
const Rx = require('rxjs/Rx')

const createActionTypes = require('./action-types')
const createActionCreators = require('./actions')

module.exports = createEpic

function createEpic (options) {
  const {
    service,
    createCid = Cuid
  } = options

  const actionTypes = createActionTypes(options)
  const actionCreators = createActionCreators(options)

  const epics = createEpics({ actionTypes, actionCreators, service, createCid })
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
  const setAll = map(value => actions.set(value.id, value))

  return {
    find: (stream) => stream
      .map(values => {
        return Rx.Observable.of(...setAll(values))
      })
      .concatAll()
    ,
    get: () => {},
    create: () => {},
    update: () => {},
    patch: () => {},
    remove: () => {}
  }
}

const createEpics = ({ actionTypes, actionCreators, service, createCid }) => {
  const requestHandlers = createRequestHandlers(actionCreators)
  const mapRequestHandlers = mapObjIndexed((requestHandler, method) => {
    return (action$, state, deps) => {
      assertFeathersDep(deps)

      const { feathers } = deps

      const requester = createRequester({ method, feathers })

      return action$.ofType(actionTypes[method])
        .mergeMap(action => {
          const args = action.payload
          const cid = createCid()

          const response = requester(args)
          const requestAction$ = requestHandler(response)

          return Rx.Observable.of(actionCreators.requestStart(cid, { service, method, args }))
            .concat(requestAction$)
            .catch(err => Rx.Observable.of(actionCreators.requestError(cid, err)))
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
