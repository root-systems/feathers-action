# feathers-action

> never write another CRUD redux action!

this module helps you use [`feathers`](http://feathersjs.com), [`redux`](http://redux.js.org), and [`tcomb`](https://www.npmjs.com/package/tcomb).

## Usage

```js
const createModule = require('feathers-action')
const createCid = require('cuid')

const module = createModule('cats')
// module.actions
// module.epic
// module.updater
```

## Dependencies

- [`feathers-reactive`](https://redux-observable.js.org/): must add plugin to feathers app / client
- [`redux-observable`](https://redux-observable.js.org/): must add middleware to redux store

## API

### module = feathersAction(name)
### module = feathersAction(options)

`options`:

- `name`
- `methods`
- TODO `idField`

### { actions, updater, epic } = module

- `actions`: object where keys are method names (`find`, `get`, `create`, ...)
- [`updater`](https://github.com/rvikmanis/redux-fp): `action => state => nextState`
- [`epic`](https://redux-observable.js.org/docs/basics/Epics.html): `(action, action$, store) => nextAction$`

### modules = feathersAction([name, ...])
### modules = feathersAction([options, ...])

where `modules` is an object where key is `name` and value is `module` as above.

### methodAction = module.actions[method](cid, ...args)

each action creator receives a `cid` (client-generated id) as the first argument.

all subsequent arguments for feathers methods are the same as the corresponding methods on the [feathers service](https://docs.feathersjs.com/api/services.html).

#### completeAction = module.actions.complete(cid)

cancels a long-running subscription as in `find` or `get`.

#### errorAction = module.actions.error(cid, err)

#### setAction = module.actions.set(cid, key, value)

sets the given key as value in the corresponding redux state.

to unset (remove key), value is `undefined`.

### nextState = module.updater(action)(state)

see ["updater" in `redux-fp`](https://github.com/rvikmanis/redux-fp): `action => state => nextState`

### nextAction$ = module.epic(action$, store, { feathers })

see ["epic" in `redux-observable`](https://redux-observable.js.org/docs/basics/Epics.html): `(action, action$, store) => nextAction$`

must pass in `{ feathers }` as `deps` to [`createEpicMiddleware`](https://redux-observable.js.org/docs/basics/SettingUpTheMiddleware.html)

```js
// client
const Feathers = require('feathers/client')
const feathersSockets = require('feathers-socketio/client')
const feathersRx = require('feathers-reactive')
const Rx = require('rxjs')

const socket = io()
const feathers = Feathers()
  .configure(feathersSockets(socket))
  .configure(feathersRx(Rx))

// store
const { createStore, applyMiddleware } = require('redux')
const { createEpicMiddleware } = require('redux-observable')

const rootEpic = require('./epic')
const rootUpdater = require('./updater')

const epicMiddleware = createEpicMiddleware(rootEpic, {
  dependencies: { feathers }
})

const store = createStore(
  (state, action) => rootUpdater(action)(state),
  applyMiddleware(epicMiddleware)
)
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

## License

The Apache License

Copyright &copy; 2017 Michael Williams

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
