const fs = require('fs/promises')
const os = require('os')
const process = require('process')
const path = require('path')
const pathResolve = require('unix-path-resolve')
const includeStatic = require('include-static')
const Bundle = require('bare-bundle')
const Localdrive = require('localdrive')
const DriveBundler = require('drive-bundler')

module.exports = async function bundle (entry, opts = {}) {
  const {
    config = null,
    cwd = path.resolve('.')
  } = opts

  if (config) {
    opts = {
      ...opts,
      ...require(path.resolve(cwd, config))
    }
  }

  const {
    platform = os.platform(),
    arch = os.arch(),
    simulator = false,
    out = null,
    format = defaultFormat(out),
    packages = true,
    prebuilds = false,
    print = false,
    indent = 2
  } = opts

  const host = `${platform}-${arch}${simulator ? '-simulator' : ''}`

  const drive = new Localdrive(cwd, { followLinks: true })

  const bundler = new DriveBundler(drive, {
    cwd,
    host,
    packages,
    prebuilds: (prebuilds && out) ? path.resolve(cwd, out, '..', 'prebuilds') : false
  })

  if (bundler.prebuilds) {
    await fs.mkdir(bundler.prebuilds, { recursive: true })
  }

  entry = pathResolve('/', path.relative(cwd, entry))

  let data

  switch (format) {
    case 'bundle':
    case 'bundle.js':
    case 'bundle.cjs':
    case 'bundle.mjs':
    case 'bundle.json':
    case 'bundle.h': {
      const { entrypoint, resolutions, sources } = await bundler.bundle(entry)

      const bundle = new Bundle()

      bundle.main = entrypoint
      bundle.resolutions = resolutions

      for (const file in sources) {
        bundle.write(file, sources[file])
      }

      data = bundle.toBuffer({ indent })
      break
    }

    case 'js':
    case 'js.h':{
      const code = await bundler.stringify(entry)

      data = Buffer.from(code)
      break
    }

    default:
      throw new Error(`unknown format "${format}"`)
  }

  switch (format) {
    case 'bundle.js':
    case 'bundle.cjs':
      data = `module.exports = ${JSON.stringify(data.toString())}\n`
      break

    case 'bundle.mjs':
      data = `export default ${JSON.stringify(data.toString())}\n`
      break

    case 'bundle.json':
      data = JSON.stringify(data.toString()) + '\n'
      break

    case 'bundle.h':
    case 'js.h':
      data = includeStatic(defaultName(out), data)
      break
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

function defaultFormat (out) {
  if (out === null) return 'bundle'
  if (out.endsWith('.bundle.js')) return 'bundle.js'
  if (out.endsWith('.bundle.cjs')) return 'bundle.cjs'
  if (out.endsWith('.bundle.mjs')) return 'bundle.mjs'
  if (out.endsWith('.bundle.json')) return 'bundle.json'
  if (out.endsWith('.bundle.h')) return 'bundle.h'
  if (out.endsWith('.js')) return 'js'
  if (out.endsWith('.js.h')) return 'js.h'
  return 'bundle'
}

function defaultName (out) {
  if (out === null) return 'bundle'
  return path.basename(out)
    .replace(/\.h$/, '')
    .replace(/[-.]+/g, '_')
    .toLowerCase()
}
