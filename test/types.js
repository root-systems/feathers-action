const Tc = require('tcomb')

const Thing = Tc.struct({
  name: Tc.String,
  description: Tc.maybe(Tc.String),
}, 'Thing')

const Things = Tc.list(Thing, 'Things')

module.exports = {
  Resource: Things
}
