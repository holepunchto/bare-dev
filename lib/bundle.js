const fs = require('fs/promises')
const path = require('path')
const pathResolve = require('unix-path-resolve')
const includeStatic = require('include-static')
const { Minimatch } = require('minimatch')
const terser = require('terser')
const Localdrive = require('localdrive')
const Bundle = require('bare-bundle')
const ScriptLinker = require('script-linker')
const obfs = require('safe-obfs')

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
    builtins = opts.builtin || [],
    imports = opts.import || {},
    importMap = null,
    header = '',
    footer = '',
    out = null,
    print = false,
    compress = false,
    obfuscate = false,
    indent = compress ? 0 : 2
  } = opts

  if (importMap) {
    const map = require(path.resolve(cwd, importMap))

    if (map.imports) {
      for (const [from, to] of Object.entries(map.imports)) {
        if (/^(\/|\.{1,2}\/?)/.test(to)) {
          imports[from] = pathResolve('/', path.relative(cwd, path.dirname(importMap)), to)
        } else {
          imports[from] = to
        }
      }
    }
  }

  const drive = new Localdrive(cwd, {
    followLinks: true
  })

  const linker = new ScriptLinker(drive, {
    bare: true,
    require: true,
    runtimes: ['bare', 'node'],
    imports,
    protocol,

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

  entry = await linker.resolve(pathResolve('/', path.relative(cwd, entry)))

  let data

  switch (format) {
    case 'bundle': {
      const bundle = new Bundle()

      bundle.imports = imports

      for await (const { module } of linker.dependencies(entry)) {
        if (module.builtin) continue

        await module.loadPackage()

        if (module.package) {
          const source = JSON.stringify(module.package, null, indent)

          bundle.write(module.packageFilename, source + (compress ? '' : '\n'))
        }

        bundle.write(module.filename, module.source, {
          main: module.filename === entry
        })
      }

      if (compress) {
        const patterns = compress.map((pattern) => new Minimatch(pattern, {
          matchBase: true,
          windowsPathsNoEscape: true
        }))

        for (const [file, data] of bundle) {
          if (
            path.extname(file) === '.json' ||
            patterns.every((pattern) => !pattern.match(path.relative('/', file)))
          ) {
            continue
          }

          const result = await terser.minify(data.toString(), {
            mangle: false,
            compress: {
              defaults: false
            }
          })

          bundle.write(file, result.code)
        }
      }

      if (obfuscate) {
        const patterns = obfuscate.map((pattern) => new Minimatch(pattern, {
          matchBase: true,
          windowsPathsNoEscape: true
        }))

        for (const [file, data] of bundle) {
          if (
            path.extname(file) === '.json' ||
            patterns.every((pattern) => !pattern.match(path.relative('/', file)))
          ) {
            continue
          }

          bundle.write(file, obfs.obfuscate(data.toString()).getObfuscatedCode())
        }
      }

      data = bundle.toBuffer({ indent })
      break
    }

    case 'js': {
      let code = await linker.bundle(entry, { header, footer })

      if (compress) {
        const result = await terser.minify(code, {
          mangle: false,
          compress: {
            defaults: false
          }
        })

        code = result.code
      }

      if (obfuscate) {
        code = obfs.obfuscate(code).getObfuscatedCode()
      }

      data = Buffer.from(code)
      break
    }

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
