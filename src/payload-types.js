const Tc = require('tcomb')
const util = require('./util')

const toCamelCase = util.toCamelCase
const toCapitalCase = util.toCapitalCase

const Options = Tc.struct({
  Resource: types.ResourceType,
  idField: Tc.maybe(Tc.String),
  idType: Tc.maybe(Tc.Type),
  methods: Tc.maybe(Tc.list(Tc.String)),
}, 'Options')

module.exports = Tc.func(Options, ActionCreators).of(createPayloadTypes)

function createPayloadTypes (options) {
  options = util.setDefaults(Options, options, {
    idField: constants.DEFAULT_ID_FIELD,
    idType: types.Id,
    methods: constants.METHODS,
  })

  const Resource = options.Resource
  const service = toCamelCase(Resource.meta.name)
  const Data = Resource.meta.type
  const idField = options.idField
  const Id = options.idType

  const payloadBase = {
    find: {
      start: {
        params: Params,
      },
      success: Resource,
    },
    get: {
      start: {
        id: Id,
        params: Params,
      },
      success: Data,
    },
    create: {
      start: {
        data: Data,
        params: Params,
      },
      success: Data,
    },
    update: {
      start: {
        id: Id,
        data: Data,
        params: Params,
      },
      success: Data,
    },
    patch: {
      start: {
        id: Id,
        data: Data,
        params: Params,
      },
      success: Data,
    },
    remove: {
      start: {
        id: Id,
        params: Params,
      },
      success: Tc.Nil,
    },
  }

  const payloads = joinPairs(map(methods, function (method) {

    const base = payloadBase[method]

    const sections = joinPairs(map(constants.SECTIONS, function (section) {
      const key = toCamelCase(method, section)
      const name = toCapitalCase(service, method, section, 'payload')

      switch (section) {
        'async':
          return [key, Tc.struct({
            service: Tc.enums.of([service]),
            method: Tc.enums.of([method])
          }, name)]
        'start':
          return [key, Tc.struct(base.start, name)]
        'success':
          return [key, props.success]
        'error':
          return [key, Error]
      }
    }))

    return [method, sections]
  }))

  return payloads
}
