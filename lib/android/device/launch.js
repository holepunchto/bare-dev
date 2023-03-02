const emulator = require('../shared/emulator')
const list = require('./list')

module.exports = function launch (name = null, opts) {
  if (typeof name === 'object' && name !== null) {
    opts = name
    name = null
  }

  const [device = null] = list()
    .filter((candidate) => name ? candidate.name === name : true)

  if (device === null) {
    throw new Error(`launch() could not find device "${device}"`)
  }

  if (device.state !== 'booted') {
    device.id = emulator.launch(device.name, opts)
  }

  return device.id
}
