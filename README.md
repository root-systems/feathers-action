# feathers-action

#### *work in progress*

never write another CRUD redux action!

this module helps you use [`feathers`](http://feathersjs.com), [`redux`](http://redux.js.org), and [`tcomb`](https://www.npmjs.com/package/tcomb).

## install

with [npm](https://www.npmjs.org):

```shell
npm install --save feathers-action
```

## usage

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

const Collection = t.List(Thing, 'Things')

module.exports = { Thing, Things }
```

```js
// actions.js
const createActionCreators = require('feathers-action').createActionCreators
const client = require('./client')
const Things = require('./types').Things

const actionCreators = createActionCreators(client, Things)

module.exports = actionCreators
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
const thunk = require('redux-thunk')
const reducer = require('./reducer')

module.exports = createStore

const createStoreWithMiddleware = redux.applyMiddleware(thunk)(redux.createStore)

function createStore (initialState) {
  return createStoreWithMiddlware(reducer, initialState)
}
```

## ecosystem

`feathers-action` is composed of small modules for each part. if you have other opinions on how to join them together, feel free to do as you please! :)

- [feathers-client](https://www.npmjs.com/package/feathers-client)
- [feathers-action-types](https://www.npmjs.com/package/feathers-action-types)
- [feathers-action-reducer](https://www.npmjs.com/package/feathers-action-reducer)
- [feathers-action-creators](https://www.npmjs.com/package/feathers-action-creators)
- [tcomb](https://www.npmjs.com/package/tcomb)
