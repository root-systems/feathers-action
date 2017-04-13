# feathers-action

> never write another CRUD redux action!

this module helps you use [`feathers`](http://feathersjs.com), [`redux`](http://redux.js.org), and [`tcomb`](https://www.npmjs.com/package/tcomb).

## Usage

```js
const feathersAction = require('feathers-action')

console.log('hello warld')
```

outputs

```
hello warld
```


## API

### module = feathersAction(name)
### module = feathersAction(options)

`options`:

- `name`
- `idField`

maybe more from [here](https://github.com/feathersjs/feathers-reactive#options)

### { actions, updater, epic } = module

- `actions`: object where keys are method names (`find`, `get`, `create`, ...)
- [`updater`](https://github.com/rvikmanis/redux-fp): `action => state => nextState`
- [`epic`](https://redux-observable.js.org/docs/basics/Epics.html): `(action, action$, store) => nextAction$`

### modules = feathersAction([name, ...])
### modules = feathersAction([options, ...])

where `modules` is an object where key is `name`.

### middleware = feathersAction.middleware(client)

all the middleware does is inject the `client` into any `FEATHERS_ACTION` actions, to be used by the relevant epics.

### Action Creators

```js
const cats = feathersAction('cats')

const action = cats.actions.create({ name: 'fluffy' }) // same as feathers client!
// returns action to be consumed by epic
assert.deepEqual(action, {
  type: 'FEATHERS_ACTION',
  payload: {
    serviceName: 'cats',
    method: 'create',
    args: {
      data: {
        name: 'fluffy'
      },
      query: {}
    }
  }
})

// TODO how can dispatch return the observable or a cid?
// we need to be able to cancel the query.
cats.actions.cancel(cid)

// then to communicate with the reducer, the epic dispatches
// used in find and get queries
cats.actions.set(id, data)

// otherwise epic sends create, update, patch, remove actions

// and to keep track of started, errored, or completed queries
const request = {
  cid: 'abcd',
  serviceName: 'cats',
  methods: 'create',
  args: {
    // ...
  }
}
// the epic dispatches these actions
cats.actions.start(request)
cats.actions.complete(request)
cats.actions.error(request)
```

## Data Models

### State

```
{
  cats: {},
  dogs: {},
  feathersAction: {
    requests: {}
  }
}
```

```js
// NOT THIS
{
  records,
  requests: {
    [cid]: {
      status: 'pending' | 'success' | 'error',
      serviceName: 'dogs',
      methods: 'create',
      previous: {}, // if update, store previous record at id, in case of rollback
      args: {},
      result: {},
      error: {}
    }
  }
}
```

Pending is an object of "start action payloads"

### Call

```js
```

### Start

```
{
  type: 'FEATHERS_DOGS_CREATE_START',
  payload: {
    service: dogs,
    serviceName: 'dogs', // ?
    method: 'create', // ?
    args: {
      data: {},
      query: {}
    }
  },
  meta: {
    cid: 'abcd'
  }
}
```

### Success

```
{
  type: 'FEATHERS_DOGS_CREATE_SUCCESS',
  payload: { // exactly what is returned by feathers
    id: 1,
    name: 'doggie'
  },
  meta: {
    cid: 'abcd'
  }
}
```

### Error

```
{
  type: 'FEATHERS_DOGS_CREATE_ERROR',
  payload: new Error('...'), // whatever error is returned
  error: true,
  meta: {
    cid: 'abcd'
  }
}
```

### Getters

```
{
  records,
  pending,
  success,
  errors,
  isPending,
  isError
}
```

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install feathers-action --save
```

## Acknowledgments

feathers-action was inspired by..

## See Also

- redux
- feathers
- tcomb

## License

Apache-2.0

