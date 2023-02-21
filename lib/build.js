const path = require('path')
const spawn = require('./spawn')

module.exports = function build (opts = {}) {
  const {
    build = 'build',
    target = null,
    cwd = process.cwd(),
    quiet = false,
    verbose = false
  } = opts

  const args = ['--build', path.resolve(cwd, build)]

  if (target) args.push('--target', target)

  if (verbose) args.push('--verbose')

  spawn('cmake', args, { quiet, verbose, cwd })
}
