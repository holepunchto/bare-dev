const path = require('path')
const Corestore = require('corestore')

module.exports = function corestore (opts = {}) {
  const {
    corestore = 'corestore',
    cwd = path.resolve('.')
  } = opts

  return new Corestore(path.resolve(cwd, corestore))
}
