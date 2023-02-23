module.exports = function test (opts = {}) {
  require('./build')({ ...opts, target: null })
  require('./build')({ ...opts, target: 'test' })
}
