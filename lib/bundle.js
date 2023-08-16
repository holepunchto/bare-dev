const fs = require('fs/promises')
const path = require('path')
const includeStatic = require('include-static')
const { Minimatch } = require('minimatch')
const Bundle = require('bare-bundle')
const ScriptLinker = require('@holepunchto/script-linker')
const obfs = require('@holepunchto/obfs').obfuscate

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
    indent = 2,
    obfuscate = false
  } = opts

  if (importMap) {
    const map = require(path.resolve(cwd, importMap))

    for (const [from, to] of Object.entries(map.imports)) {
      if (/^(\/|\.{1,2}\/?)/.test(to)) {
        imports[from] = path.resolve(cwd, path.dirname(importMap), to)
      } else {
        imports[from] = to
      }
    }
  }

  const builtins = ['assert', 'buffer', 'console', 'events', 'module', 'path', 'timers']
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

    mapPath (p) {
      p = path.relative(cwd, p)
      if (p.startsWith('..')) {
        const i = p.indexOf('node_modules')
        if (i === -1) throw new Error(`${p} is outside working directory`)
        p = p.slice(i)
      }
      return path.join('/', p)
    },

    readFile (filename) {
      return fs.readFile(filename)
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

  entry = await linker.resolve(path.resolve(cwd, entry))

  let data

  switch (format) {
    case 'bundle': {
      const bundle = new Bundle()

      for (const [from, to] of Object.entries(imports)) {
        if (/^(\/|\.{1,2}\/?)/.test(to)) {
          bundle.imports[from] = linker.mapPath(to)
        } else {
          bundle.imports[from] = to
        }
      }

      for await (const { module } of linker.dependencies(entry)) {
        if (module.builtin) continue

        if (module.package) {
          const source = JSON.stringify(module.package, null, indent)

          bundle.write(linker.mapPath(module.packageFilename), source + '\n')
        }

        bundle.write(linker.mapPath(module.filename), module.source, {
          main: module.filename === entry
        })
      }

      if (obfuscate) {
        const patterns = obfuscate.map((pattern) => new Minimatch(pattern, {
          matchBase: true,
          windowsPathsNoEscape: true
        }))

        bundle.map((data, file) => {
          file = path.relative('/', file)

          if (path.extname(file) === '.json' || patterns.every((pattern) => !pattern.match(file))) {
            return data
          }

          return Buffer.from(obfs(data.toString()).getObfuscatedCode())
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
