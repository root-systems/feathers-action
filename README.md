# feathers-action

#### *work in progress*

use [`feathers`](http://feathersjs.com) with [`redux`](http://redux.js.org)

## install

with [npm](https://www.npmjs.org):

```shell
npm install --save feathers-action
```

## usage

```js
// client.js
var feathers = require('feathers-client')
var fetch = require('isomorphic-fetch')

var client = feathers()
  .configure(feathers.fetch(fetch))

module.exports = client
```

```js
// actions.js
var createActionCreators = require('feathers-action').createActionCreators
var client = require('./client')

var actionCreators = createActionCreators(client, 'todos')

module.exports = actionCreators
```

```js
// reducer.js
var createReducer = require('feathers-action').createReducer

var reducer = createReducer('todos')
```

```js
// store.js
var redux = require('redux')
var thunk = require('redux-thunk')
var reducer = require('./reducer')

module.exports = createStore

var createStoreWithMiddleware = redux.applyMiddleware(thunk)(redux.createStore)

function createStore (initialState) {
  return createStoreWithMiddlware(reducer, initialState)
}
```

## ecosystem

`feathers-action` is composed of modules for each part. if you have other opinions on how to join them together, feel free to do as you please! :)

- [feathers-client](https://www.npmjs.org/package/feathers-client)
- [feathers-action-types](https://github.com/ahdinosaur/feathers-action-types)
- [feathers-action-reducer](https://github.com/ahdinosaur/feathers-action-reducer)
- [feathers-action-creators](https://github.com/ahdinosaur/feathers-action-creators)
- [tcomb](https://www.npmjs.org/package/tcomb)
