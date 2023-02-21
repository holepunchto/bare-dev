const build = require('./build')

module.exports = function test (opts = {}) {
  build({ ...opts, target: null })
  build({ ...opts, target: 'test' })
}
