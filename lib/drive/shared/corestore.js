const path = require('path')
const Corestore = require('corestore')

module.exports = function corestore (opts = {}) {
  const {
    corestore = 'corestore',
    cwd = process.cwd()
  } = opts

  return new Corestore(path.resolve(cwd, corestore))
}
