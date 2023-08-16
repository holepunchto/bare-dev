const fs = require('fs')
const path = require('path')

module.exports = function install (opts = {}) {
  const {
    prebuilds = 'prebuilds',
    platform = process.platform,
    arch = process.arch,
    force = false,
    sync = false,
    recursive = true,
    cwd = process.cwd()
  } = opts

  if (force || !isDirectory(path.resolve(cwd, prebuilds, `${platform}-${arch}`))) {
    if (sync) require('./vendor/sync')(opts)

    if (isFile(path.join(cwd, 'CMakeLists.txt'))) {
      require('./rebuild')(opts)
    }
  }

  if (recursive) {
    const nodeModules = path.join(cwd, 'node_modules')

    if (isDirectory(nodeModules)) {
      for (const base of fs.readdirSync(nodeModules)) {
        const directory = path.join(nodeModules, base)

        if (!isDirectory(directory)) continue

        install({
          ...opts,

          cwd: directory,

          // Build options
          source: directory,
          build: path.join(directory, 'build'),
          target: null,

          prebuilds,
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
