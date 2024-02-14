const path = require('path')
const spawn = require('./shared/spawn')
const cmake = require('./shared/cmake')

module.exports = function test (opts = {}) {
  exports.ctest(opts)
}

exports.ctest = function (opts = {}) {
  const {
    build = 'build',
    timeout = 30,
    debug = false,
    cwd = path.resolve('.'),
    verbose = false
  } = opts

  const args = [
    '--test-dir', path.resolve(cwd, build),
    '--build-config', debug ? 'Debug' : 'Release',
    '--timeout', timeout,
    '--output-on-failure'
  ]

  if (verbose) args.push('--verbose')
  else args.push('--progress')

  spawn(cmake.ctest(), args, opts)
}
