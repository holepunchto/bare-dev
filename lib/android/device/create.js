const avd = require('../shared/avd')

module.exports = function create (name, version, opts) {
  avd.manager.create(name, version, opts)
}
