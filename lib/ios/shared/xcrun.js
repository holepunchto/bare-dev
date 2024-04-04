const which = require('bare-which')
const exec = require('../../shared/exec')

const xcrun = module.exports = exports = function xcrun () {
  return which.sync('xcrun')
}

exports.find = function find (tool, opts = {}) {
  return exec(xcrun(), ['--find', tool], opts).trim()
}
