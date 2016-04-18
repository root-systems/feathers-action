const Tc = require('tcomb')

const Thing = Tc.struct({
  name: Tc.String
}, 'Thing')

const Things = Tc.list(Thing, 'Things')

module.exports = {
  Resource: Things
}
