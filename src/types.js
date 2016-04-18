const Tc = require('tcomb')

const TypeWithName = Tc.refinement(
  Tc.Type,
  (type) => !Tc.Nil.is(type.meta.name),
  'Type with meta.name'
)

const ResourceType = Tc.refinement(
  TypeWithName,
  (type) => type.meta.kind === 'list',
  'ResourceType (tcomb.list with name)'
)

const Id = Tc.union([Tc.String, Tc.Number], 'Id')
const Params = Tc.maybe(Tc.Object)

const Cid = Tc.String
const Meta = Tc.struct({
  cid: Cid
})

module.exports = {
  ResourceType,
  Id,
  Cid,
  Params,
  Meta,
}
