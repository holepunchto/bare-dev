const path = require('path')
const which = require('which')
const spawn = require('./shared/spawn')

module.exports = function prebuild (opts = {}) {
  const cmake = which.sync('cmake')

  const {
    build = 'build',
    prebuilds = 'prebuilds',
    cwd = process.cwd()
  } = opts

  require('./build')(opts)

  const args = [
    '--install', path.resolve(cwd, build),
    '--prefix', path.resolve(cwd, prebuilds)
  ]

  spawn(cmake, args, { ...opts, cwd })
}
