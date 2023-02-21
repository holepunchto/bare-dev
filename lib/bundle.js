const fs = require('fs/promises')
const path = require('path')
const ScriptLinker = require('script-linker')
const includeStatic = require('include-static')
const Bundle = require('@pearjs/bundle')

module.exports = async function bundle (entry, opts = {}) {
  const {
    config = null,
    cwd = process.cwd()
  } = opts

  if (config) {
    opts = {
      ...opts,
      ...require(path.resolve(cwd, config))
    }
  }

  const {
    protocol = 'app',
    format = 'bundle',
    target = 'js',
    name = 'bundle',
    imports = {},
    importMap = null,
    header = '',
    footer = '',
    out = null,
    print = false,
    indent = 2
  } = opts

  if (importMap) {
    const map = require(path.resolve(cwd, importMap))

    for (const [from, to] of Object.entries(map.imports)) {
      imports[from] = to
    }
  }

  const linker = new ScriptLinker({
    bare: true,
    protocol,

    map (id, { protocol }) {
      return `${protocol}:${path.relative('/', id)}`
    },

    mapResolve (id) {
      if (id in imports) id = imports[id]
      return id
    },

    readFile (filename) {
      return fs.readFile(path.join(cwd, filename))
    },

    builtins: {
      has () {
        return false
      },
      async get () {
        return null
      },
      keys () {
        return []
      }
    }
  })

  entry = path.resolve('/', path.relative(cwd, entry))

  let data

  switch (format) {
    case 'bundle': {
      const bundle = new Bundle()

      for (const [from, to] of Object.entries(imports)) {
        bundle.imports[from] = to
      }

      for await (const { module } of linker.dependencies(entry)) {
        if (module.builtin) continue

        if (module.package) {
          const source = JSON.stringify(module.package, null, indent)

          bundle.write(module.packageFilename, source + '\n')
        }

        bundle.write(module.filename, module.source, {
          main: module.filename === entry
        })
      }

      data = bundle.toBuffer({ indent })
      break
    }

    case 'js':
      data = Buffer.from(await linker.bundle(entry, { header, footer }))
      break

    default:
      throw new Error(`unknown format "${format}"`)
  }

  switch (target) {
    case 'js':
      break

    case 'c':
      data = includeStatic(name, data)
      break

    default:
      throw new Error(`unknown target "${format}"`)
  }

  if (print || out) {
    if (print) {
      process.stdout.write(data)
    }

    if (out) {
      await fs.writeFile(path.resolve(cwd, out), data)
    }
  }

  return data
}
