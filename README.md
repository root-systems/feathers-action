# feathers-action

never write another CRUD redux action!

this module helps you use [`feathers`](http://feathersjs.com), [`redux`](http://redux.js.org), and [`tcomb`](https://www.npmjs.com/package/tcomb).

## install

with [npm](https://www.npmjs.org):

```shell
npm install --save feathers-action
```

## usage

let's imagine we have a simple app of things.

we setup our feathers client.

```js
// client.js
const feathers = require('feathers-client')
const fetch = require('isomorphic-fetch')

const client = feathers()
  .configure(feathers.fetch(fetch))

module.exports = client
```

```js
// types.js
const t = require('tcomb')

const Thing = t.struct({
  id: t.Number,
  name: t.String,
  description: t.String
}, 'Thing')

const Things = t.List(Thing, 'Things')

module.exports = { Thing, Things }
```

```js
// actions.js
const createActions = require('feathers-action').createActions
const Things = require('./types').Things

const actions = createActions(client, Things)
// or actionCreators = createActionCreators(...)

module.exports = actions
```

```js
// reducer.js
const createReducer = require('feathers-action').createReducer
const Things = require('./types').Things

const reducer = createReducer(Things)
```

```js
// store.js
const redux = require('redux')
const createMiddleware = require('feathers-action').createMiddleware
const reducer = require('./reducer')
const client = require('./client')

module.exports = createStore

function createStore (initialState) {
  const enhancer = redux.applyMiddleware(
    createMiddleware(client)
  )
  return redux.createStore(reducer, initialState, enhancer)
}
```
