const fs = require('fs')
const path = require('path')
const glob = require('glob')

module.exports = function install (opts = {}) {
  const {
    build = 'build',
    prebuilds = 'prebuilds',
    platform = process.platform,
    arch = process.arch,
    force = false,
    sync = false,
    recursive = true,
    cwd = process.cwd()
  } = opts

  const pkg = require(path.join(cwd, 'package.json'))

  const target = path.resolve(cwd, prebuilds, `${platform}-${arch}`, `${pkg.name}.bare`)

  if (force || prebuilds === false || !isFile(target)) {
    if (sync) require('./vendor/sync')(opts)

    if (isFile(path.join(cwd, 'CMakeLists.txt'))) {
      require('./rebuild')(opts)

      if (prebuilds) {
        fs.mkdirSync(path.dirname(target), { recursive: true })

        const [addon] = glob.globSync(path.join(cwd, build, '**/*.bare'), {
          windowsPathsNoEscape: true
        })

        if (addon) fs.copyFileSync(addon, target)
      }
    }
  }

  if (recursive) {
    const nodeModules = path.join(cwd, 'node_modules')

    if (isDirectory(nodeModules)) {
      for (const base of fs.readdirSync(nodeModules)) {
        const directory = path.join(nodeModules, base)

        if (isFile(path.join(directory, 'package.json'))) {
          install({
            ...opts,

            cwd: directory,

            // Build options
            source: directory,
            target: null,

            build: path.relative(cwd, build),
            prebuilds: path.relative(cwd, prebuilds),

            platform,
            arch,
            force,
            sync,
            recursive,

            submodules: false // Never synchronize submodules
          })
        }
      }
    }
  }
}

function isFile (file) {
  try {
    return fs.statSync(file).isFile()
  } catch {
    return false
  }
}

function isDirectory (directory) {
  try {
    return fs.statSync(directory).isDirectory()
  } catch {
    return false
  }
}
