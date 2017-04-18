var { combineEpics } = require('redux-observable')

const testEpic = (action$) => action$

module.exports = combineEpics(testEpic)
