const process = require('process')
const adb = require('../shared/adb')
const emulator = require('../shared/emulator')

module.exports = function list (opts = {}) {
  const {
    separator = '\n',
    quiet = true
  } = opts

  const devices = adb.devices(opts)

  for (const name of emulator.list(opts)) {
    if (devices.some((device) => device.name === name)) continue

    devices.push({
      id: null,
      type: 'emulator',
      name,
      state: 'shutdown'
    })
  }

  if (!quiet) {
    let first = true

    for (const device of devices) {
      let out = device.name

      if (/^\s+$/.test(separator)) {
        out += separator
      } else {
        first ? first = false : out = separator + out
      }

      process.stdout.write(out)
    }
  }

  return devices
}
