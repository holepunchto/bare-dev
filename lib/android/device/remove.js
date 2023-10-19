const avd = require('../shared/avd')

module.exports = function remove (name, opts) {
  avd.manager.remove(name, opts)
}
