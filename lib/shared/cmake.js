const path = require('path')
const which = require('bare-which')

module.exports = exports = function cmake () {
  return which.sync('cmake')
}

exports.ctest = function ctest () {
  return which.sync('ctest')
}

exports.toPath = function toPath (input, opts = {}) {
  const {
    normalize = true
  } = opts

  if (normalize) input = path.normalize(input)

  return input.replace(/\\/g, '/')
}
