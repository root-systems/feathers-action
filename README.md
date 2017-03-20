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

### var action = createActions(opts={})
Creates a new set of actions for the `Resource` passed to `opts`.
Valid `opts` keys include:
- `Resource` (required) - a named `tcomb` list type.

eg:
```js
var feathersAction = require('feathers-action')
var tc = require('tcomb')

const Thing = Tc.struct({
  id: Tc.maybe(Tc.Number),
  name: Tc.String
  }, 'Thing')
const Things = Tc.list(Thing, 'Things')
const actions = createActions({ Resource: Things })
```

See [api_formatting.md](api_formatting.md) for tips.

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

