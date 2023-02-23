module.exports = function rebuild (opts = {}) {
  require('./clean')({ ...opts, quiet: true })
  require('./configure')(opts)
  require('./build')(opts)
}
