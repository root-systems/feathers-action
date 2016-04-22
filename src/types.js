const Tc = require('tcomb')
const Symbol = require('es-symbol')

const isSymbol = function (symbol) {
  return symbol && (
    // es6 symbol check
    typeof symbol === 'symbol' ||
    // es-symbol check
    // https://github.com/goatslacker/es-symbol/blob/master/src/symbol.js#L17-L19
    (symbol[Symbol.toStringTag] === 'Symbol')
  )
}

const SymbolType = Tc.irreducible('Symbol', isSymbol)

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

const Methods = Tc.list(Tc.String)

const Options = Tc.struct({
  Resource: ResourceType,
  methods: Tc.maybe(Methods)
})

const Id = Tc.union([Tc.String, Tc.Number], 'Id')
const Params = Tc.maybe(Tc.Object)

const Cid = Tc.String
const Meta = Tc.struct({
  cid: Cid
})


module.exports = {
  Symbol: SymbolType,
  ResourceType,
  Options,
  Id,
  Cid,
  Params,
  Meta,
}
