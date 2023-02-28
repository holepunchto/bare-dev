const which = require('which')
const exec = require('../exec')

const xcrun = which.sync('xcrun')

exports.find = function find (tool, opts = {}) {
  return exec(xcrun, ['--find', tool], opts).trim()
}
