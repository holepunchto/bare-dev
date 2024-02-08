const fs = require('fs/promises')
const process = require('process')
const path = require('path')
const pathResolve = require('unix-path-resolve')
const Localdrive = require('localdrive')
const DriveBundler = require('drive-bundler')

module.exports = async function bundle (entry, opts = {}) {
  const {
    config = null,
    cwd = path.resolve('.'),
    quiet = true
  } = opts

  if (config) {
    opts = {
      ...opts,
      ...require(path.resolve(cwd, config))
    }
  }

  const {
    packages = true,
    print = false,
    separator = '\n',
    out = null
  } = opts

  const drive = new Localdrive(cwd, { followLinks: true })

  const bundler = new DriveBundler(drive, { cwd, packages, prebuilds: false })

  entry = pathResolve('/', path.relative(cwd, entry))

  const { sources } = await bundler.bundle(entry)

  const result = Object
    .keys(sources)
    .map((file) => path.join(cwd, path.normalize(file)))
    .sort()

  if (out) {
    let data

    switch (path.extname(out)) {
      case '.d':
        data = `${path.resolve(cwd, out.replace(/\.d$/, ''))}: ${result.join(' ')}\n`
        break

      default:
        throw new Error(`unsupported extension "${out}"`)
    }

    await fs.writeFile(path.resolve(cwd, out), data)
  }

  if (quiet || !print) return result

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
