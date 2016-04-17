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

### const reducer = createReducer(opts={})
Creates a new reducer to pass to `redux.createStore`.
Valid `opts` keys include:
- `Resource` (required) - A tcomb named list type describing the resource.

eg:
```js
const { createReducer } = require('feathers-action')
const Tc = require('tcomb')

const Thing = Tc.struct({
  id: Tc.maybe(Tc.Number),
  name: Tc.String
}, 'Thing')
const Things = Tc.list(Thing, 'Things')

const reducer = createReducer({Resource: Things})
const store = createStore(reducer, {}, enhancer)
```

### const middleware = createMiddleware(opts={})
Creates a new middleware to pass to `redux.createStore`.
Valid `opts` keys include:
- `client` (required) - the feathers client instance..

eg:
```js
const { createMiddleware } = require('feathers-action')
const { createStore, applyMiddleware } = require('redux')
const feathers = require('feathers/client')

const client = feathers().configure(...)

const middleware = createMiddleware({ client })
const enhancer = applyMiddleware(middleware) 
const store = createStore(state => state, {}, enhancer)
```

### const actions = createActions(opts={})
Creates a new set of actions for the `Resource` passed to `opts`.
Valid `opts` keys include:
- `Resource` (required) - a named `tcomb` list type.

eg:
```js
const { createActions } = require('feathers-action')
const Tc = require('tcomb')

const Thing = Tc.struct({
  id: Tc.maybe(Tc.Number),
  name: Tc.String
}, 'Thing')

const Things = Tc.list(Thing, 'Things')
const actions = createActions({ Resource: Things })
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

