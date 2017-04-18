var { combineEpics } = require('redux-observable')

const testEpic = (action$, state, deps) => action$

module.exports = combineEpics(testEpic)
