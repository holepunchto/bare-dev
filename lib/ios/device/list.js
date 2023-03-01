const exec = require('../../shared/exec')

module.exports = function list (term = 'available', opts = {}) {
  const simctl = require('../shared/xcrun').find('simctl')

  const {
    separator = '\n',
    quiet = true
  } = opts

  const json = JSON.parse(
    exec(simctl, ['list', '--json', '--no-escape-slashes', 'devices', term], opts)
  )

  const result = []

  let first = true

  for (const [, devices] of Object.entries(json.devices)) {
    for (const device of devices) {
      result.push({
        id: device.udid,
        name: device.name,
        state: device.state.toLowerCase(),
        available: device.isAvailable
      })

      if (quiet) continue

      let out = `${device.name} (${device.state})`

      if (/^\s+$/.test(separator)) {
        out += separator
      } else {
        first ? first = false : out = separator + out
      }

      process.stdout.write(out)
    }
  }

  return result
}
