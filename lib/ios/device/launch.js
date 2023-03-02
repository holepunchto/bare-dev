const simctl = require('../shared/simctl')
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

  if (device.state !== 'booted') simctl.launch(device.id, opts)

  return device.id
}
