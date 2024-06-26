const path = require('path')
const fs = require('fs')
const spawn = require('./shared/spawn')
const cmake = require('./shared/cmake')
const gradle = require('./shared/gradle')
const paths = require('./paths')

module.exports = exports = function build (opts = {}) {
  const {
    cwd = path.resolve('.'),
    cmake = fs.existsSync(path.join(cwd, 'CMakeLists.txt')),
    gradle = fs.existsSync(path.join(cwd, 'build.gradle'))
  } = opts

  if (cmake) return exports.cmake(opts)

  if (gradle) return exports.gradle(opts)

  throw new Error('no build system recognized')
}

exports.cmake = function (opts = {}) {
  const {
    build = 'build',
    target = null,
    debug = false,
    cwd = path.resolve('.'),
    verbose = false
  } = opts

  const args = ['--build', path.resolve(cwd, build), '--config', debug ? 'Debug' : 'Release']

  if (target) args.push('--target', target)

  if (verbose) args.push('--verbose')

  return spawn(cmake(), args, opts)
}

exports.gradle = function (opts = {}) {
  const {
    target = 'build',
    env = process.env
  } = opts

  return spawn(gradle(), [target], {
    ...opts,
    env: {
      ...env,
      CMAKE_MODULE_PATH: cmake.toPath(paths.cmake)
    }
  })
}
