const which = require('which')
const exec = require('../../shared/exec')

const list = require('./list')

module.exports = function boot (term = 'available', opts = {}) {
  const {
    open = false
  } = opts

  const simctl = require('../shared/xcrun').find('simctl')

  for (const device of list(term)) {
    if (device.state === 'booted') return

    if (device.available) {
      exec(simctl, ['boot', device.id], opts)

      if (open) exec(which.sync('open'), ['-a', 'Simulator.app'], opts)

      return
    }
  }

  throw new Error(`boot() could not find device with terms "${term}"`)
}
