const path = require('path')
const spawn = require('./spawn')

module.exports = function prebuild (opts = {}) {
  const {
    build = 'build',
    prebuilds = 'prebuilds',
    cwd = process.cwd(),
    quiet = false,
    verbose = false
  } = opts

  exports.build(opts)

  const args = [
    '--install', path.resolve(cwd, build),
    '--prefix', path.resolve(cwd, prebuilds)
  ]

  spawn('cmake', args, { quiet, verbose, cwd })
}
