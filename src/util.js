const Tc = require('tcomb')
const join = require('lodash/join')
const reduce = require('lodash/reduce')
const assign = require('lodash/assign')
const replace = require('lodash/replace')
const toUpper = require('lodash/toUpper')
const camelCase = require('lodash/camelCase')
const snakeCase = require('lodash/snakeCase')
const startCase = require('lodash/startCase')

module.exports = {
  toCamelCase: function () {
    return camelCase(join(arguments, ' '))
  },
  toConstantCase: function () {
    return toUpper(snakeCase(join(arguments, ' ')))
  },
  toCapitalCase: function () {
    return replace(startCase(join(arguments, ' ')), /\W+/g, '')
  },
  setDefaults: function (Type, props, defaults) {
    var patch = reduce(props, function (sofar, nextValue, nextKey) {
      var defaultProp = defaults[nextKey]
      if (
        Tc.Nil.is(nextValue) &&
        !Tc.Nil.is(defaultProp)
      ) {
        sofar[nextKey] = { $set: defaultProp }
      }
      return sofar
    }, {})

    return Type.update(props, patch)
  },
  mirrorKeyValue: function (array) {
    return reduce(array, function (sofar, next) {
      return assign(sofar, { [next]: next })
    }, {})
  },
}
