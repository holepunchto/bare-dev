const path = require('path')
const which = require('which')

module.exports = exports = function cmake () {
  return which.sync('cmake')
}

exports.toPath = function toPath (input, opts = {}) {
  const {
    normalize = true
  } = opts

  if (normalize) input = path.normalize(input)

  return input.replace(/\\/g, '/')
}
