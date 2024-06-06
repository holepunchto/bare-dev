const process = require('process')
const path = require('path')
const Corestore = require('corestore')

module.exports = function corestore (opts = {}) {
  const {
    corestore = process.env.BARE_DEV_CORESTORE || 'corestore',
    cwd = path.resolve('.')
  } = opts

  return new Corestore(path.resolve(cwd, corestore))
}
