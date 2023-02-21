const clean = require('./clean')
const configure = require('./configure')
const build = require('./build')

module.exports = function rebuild (opts = {}) {
  clean({ ...opts, quiet: true })
  configure(opts)
  build(opts)
}
