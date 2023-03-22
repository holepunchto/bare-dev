const path = require('path')
const fs = require('fs')
const spawn = require('./shared/spawn')
const cmake = require('./shared/cmake')
const gradle = require('./shared/gradle')

module.exports = exports = function build (opts = {}) {
  const {
    cwd = process.cwd()
  } = opts

  if (fs.existsSync(path.join(cwd, 'CMakeLists.txt'))) {
    return exports.cmake(opts)
  }

  if (fs.existsSync(path.join(cwd, 'build.gradle'))) {
    return exports.gradle(opts)
  }

  throw new Error('no build system recognized')
}

exports.cmake = function (opts = {}) {
  const {
    build = 'build',
    target = null,
    debug = false,
    cwd = process.cwd(),
    verbose = false
  } = opts

  const args = ['--build', path.resolve(cwd, build), '--config', debug ? 'Debug' : 'Release']

  if (target) args.push('--target', target)

  if (verbose) args.push('--verbose')

  spawn(cmake(), args, opts)
}

exports.gradle = function (opts = {}) {
  const {
    target = 'build'
  } = opts

  spawn(gradle(), [target], opts)
}
