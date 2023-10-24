const path = require('path')
const Localdrive = require('localdrive')
const ScriptLinker = require('@holepunchto/script-linker')

module.exports = async function bundle (entry, opts = {}) {
  const {
    config = null,
    cwd = process.cwd(),
    quiet = true
  } = opts

  if (config) {
    opts = {
      ...opts,
      ...require(path.resolve(cwd, config))
    }
  }

  const {
    builtins = opts.builtin || ['assert', 'buffer', 'console', 'events', 'module', 'os', 'path', 'timers', 'url'],
    imports = opts.import || {},
    importMap = null,
    nodeModules = 'node_modules',
    separator = '\n'
  } = opts

  if (importMap) {
    const map = require(path.resolve(cwd, importMap))

    for (const [from, to] of Object.entries(map.imports)) {
      if (/^(\/|\.{1,2}\/?)/.test(to)) {
        imports[from] = path.resolve('/', path.relative(cwd, path.dirname(importMap)), to)
      } else {
        imports[from] = to
      }
    }
  }

  const drive = new Localdrive(cwd, {
    followLinks: true,
    roots: {
      '/node_modules': path.resolve(cwd, nodeModules)
    }
  })

  const linker = new ScriptLinker(drive, {
    bare: true,
    require: true,

    mapResolve (id) {
      if (id in imports) id = imports[id]
      return id
    },

    builtins: {
      has (req) {
        return builtins.includes(req)
      },
      get (req) {
        return require(req)
      },
      keys () {
        return builtins
      }
    }
  })

  entry = await linker.resolve(path.resolve('/', path.relative(cwd, entry)))

  const files = new Set()

  for await (const { module } of linker.dependencies(entry)) {
    if (module.builtin) continue

    if (module.package) {
      files.add(path.join(cwd, module.packageFilename))
    }

    files.add(path.join(cwd, module.filename))
  }

  const result = [...files].sort()

  if (quiet) return result

  let first = true

  for (const file of result) {
    let out = file

    if (/^\s+$/.test(separator)) {
      out += separator
    } else {
      first ? first = false : out = separator + out
    }

    process.stdout.write(out)
  }

  return result
}
