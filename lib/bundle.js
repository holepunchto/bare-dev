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
    format = 'bundle',
    target = 'js',
    name = 'bundle',
    header = '',
    footer = '',
    packages = true,
    prebuilds = false,
    out = null,
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

  entry = pathResolve('/', path.relative(cwd, entry))

  let data

  switch (format) {
    case 'bundle': {
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

    case 'js': {
      const code = await bundler.stringify(entry)

      data = Buffer.from(header + code + footer)
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
      throw new Error(`unknown target "${target}"`)
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
