const process = require('process')
const simctl = require('../shared/simctl')

module.exports = function list (opts = {}) {
  const {
    separator = '\n',
    quiet = true
  } = opts

  const devices = simctl.list(opts)

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
