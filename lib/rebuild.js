module.exports = function rebuild (opts = {}) {
  require('./clean')({ ...opts, quiet: true })
  require('./configure')({ ...opts, quiet: true })
  require('./build')(opts)
}
