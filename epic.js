const { combineEpics, ofType } = require('redux-observable')
const is = require('typeof-is')
const either = require('ramda/src/either')
const merge = require('ramda/src/merge')
const mapObjIndexed = require('ramda/src/mapObjIndexed')
const values = require('ramda/src/values')
const pathEq = require('ramda/src/pathEq')
const propEq = require('ramda/src/propEq')
const find = require('ramda/src/find')
const not = require('ramda/src/not')
const filter = require('ramda/src/filter')
const { of, from, concat: indexConcat, merge: indexMerge } = require('rxjs')
const {
  mergeMap,
  first,
  concatMap,
  pairwise,
  map,
  mapTo,
  take,
  catchError,
  startWith,
  concat,
  takeWhile,
  filter: rxFilter,
  merge: rxMerge
} = require('rxjs/operators')

const createActionTypes = require('./action-types')
const createActionCreators = require('./actions')

module.exports = createEpic

function createEpic (options) {
  const {
    service
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
  return {
    find: (response$, { cid }) => indexConcat(
      // set all initial results
      from(response$).pipe(
        first(),
        concatMap(values => of(
          actions.setAll(cid, values),
          actions.ready(cid)
        ))
      ),
      // update the next results as a pairwise diff
      from(response$).pipe(
        pairwise(),
        concatMap(([prev, next]) => {
          const removed = getRemoved(prev, next)
          const diff = [
            actions.unsetAll(cid, removed),
            actions.setAll(cid, next)
          ]
          return of(...diff)
        })
      )
    ),
    get: (response$, { cid, args }) => indexMerge(
      from(response$).pipe(
        map(value => {
          // `feathers-reactive` return null on 'removed' events
          return (value === null)
            ? actions.unset(cid, args.id)
            : actions.set(cid, args.id, value)
        })
      ),
      from(response$).pipe(
        first(),
        mapTo(actions.ready(cid))
      )
    ),
    create: (response$, { cid, args }) => {
      const setOptimistic = actions.set(cid, cid, args.data)
      const unsetOptimistic = actions.unset(cid, cid)

      const responseAction$ = from(response$).pipe(
        take(1),
        concatMap(value => of(
          actions.set(cid, value.id, value),
          actions.ready(cid)
        )),
        catchError(err => of(actions.error(cid, err)))
      )
      return of(setOptimistic).pipe(
        concat(responseAction$.pipe(
          startWith(unsetOptimistic))
        )
      )
    },
    update: createUpdateOrPatchHandler({
      method: 'update',
      getOptimisticData: ({ args }) => {
        return merge({ id: args.id }, args.data)
      }
    }),
    patch: createUpdateOrPatchHandler({
      method: 'patch',
      getOptimisticData: ({ args, previousData }) => {
        return merge(previousData, args.data)
      }
    }),
    remove: (response$, { cid, args, service, state$ }) => {
      const state = state$.value
      const previousData = state[service][args.id]
      const setOptimistic = actions.unset(cid, args.id)
      const resetOptimistic = actions.set(cid, args.id, previousData)

      const responseAction$ = from(response$).pipe(
        take(1),
        concatMap(value => of(
          actions.unset(cid, value.id),
          actions.ready(cid)
        )),
        catchError(err => of(resetOptimistic, actions.error(cid, err)))
      )

      return of(setOptimistic).pipe(
        concat(responseAction$)
      )
    }
  }

  // TODO: only rollback when _all_ updates for that id have errored
  // TODO: find a way to pass in actions for all updates of the same id
  function createUpdateOrPatchHandler (options) {
    const { getOptimisticData } = options

    return (response$, { cid, args, service, state$ }) => {
      const state = state$.value
      const previousData = state[service][args.id]
      const optimisticData = getOptimisticData({ args, previousData })

      const setOptimistic = actions.set(cid, args.id, optimisticData)
      const resetOptimistic = actions.set(cid, args.id, previousData)

      const responseAction$ = from(response$).pipe(
        take(1),
        concatMap(value => of(
          actions.set(cid, value.id, value),
          actions.ready(cid)
        )),
        catchError(err => of(resetOptimistic, actions.error(cid, err)))
      )

      return of(setOptimistic).pipe(
        concat(responseAction$)
      )
    }
  }
}

const createEpics = ({ actionTypes, actionCreators, service }) => {
  const isCompleteAction = isType(actionTypes.complete)
  const isErrorAction = isType(actionTypes.error)
  const isEndAction = either(isCompleteAction, isErrorAction)
  const requestHandlers = createRequestHandlers(actionCreators)
  const mapRequestHandlers = mapObjIndexed((requestHandler, method) => {
    return (action$, state$, deps) => {
      assertFeathersDep(deps)

      const { feathers } = deps

      const requester = createRequester({ method, feathers, service })

      return action$.pipe(
        ofType(actionTypes[method]),
        mergeMap(action => {
          const args = action.payload
          const { cid } = action.meta

          const response$ = requester(args)
          const requestAction$ = requestHandler(response$, { cid, args, service, state$ })

          const cidAction$ = action$.pipe(rxFilter(isCid(cid)))
          const completeAction$ = cidAction$.pipe(rxFilter(isCompleteAction))
          const errorAction$ = cidAction$.pipe(rxFilter(isErrorAction))
          const cancelAction$ = completeAction$.pipe(rxMerge(errorAction$))

          return of(actionCreators.start(cid, { service, method, args })).pipe(
            concat(requestAction$),
            concat(of(actionCreators.complete(cid))),
            catchError(err => of(actionCreators.error(cid, err))),
            takeWhile(endOnce(isEndAction))
            // takeUntil(cancelAction$),
            // rxFilter(endOnce(isEndAction))
          )
        })
      )
    }
  })
  return mapRequestHandlers(requestHandlers)
}

const createRequester = ({ feathers, method, service }) => {
  const feathersService = feathers.service(service)
  return payload => {
    const args = requestArgs[method](payload)
    return feathersService[method](...args)
  }
}

function assertFeathersDep (deps = {}) {
  if (is.undefined(deps.feathers)) {
    throw new Error('feathers-action/epic: expected feathers app or client to be given as dependency in redux-observable middleware')
  }
}

const isCid = pathEq(['meta', 'cid'])
const isType = propEq('type')

const endOnce = (isEndAction) => {
  var isDone = false
  return (value) => {
    if (isEndAction(value)) {
      if (isDone) return false
      isDone = true
      return true
    }
    return true
  }
}

const getRemoved = (prev, next) => {
  return filter(value => {
    return not(find(propEq('id', value.id), next))
  }, prev)
}
