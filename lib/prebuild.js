const path = require('path')
const spawn = require('./shared/spawn')
const cmake = require('./shared/cmake')

module.exports = function prebuild (opts = {}) {
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

  spawn(cmake(), args, { ...opts, cwd })
}
