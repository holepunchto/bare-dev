const path = require('path')
const runtime = require('cmake-runtime')

module.exports = exports = function cmake () {
  return runtime('cmake')
}

exports.ctest = function ctest () {
  return runtime('ctest')
}

exports.toPath = function toPath (input, opts = {}) {
  const {
    normalize = true
  } = opts

  if (normalize) input = path.normalize(input)

  return input.replace(/\\/g, '/')
}
