const path = require('path')
const launch = require('./device/launch')
const adb = require('./shared/adb')

module.exports = function run (apk, opts = {}) {
  const {
    device = null,
    cwd = process.cwd()
  } = opts

  const id = launch(device, opts)

  apk = path.resolve(cwd, apk)

  adb.install(id, apk, opts)
  adb.start(id, apk, opts)
}
