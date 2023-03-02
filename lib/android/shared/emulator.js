const path = require('path')
const os = require('os')
const childProcess = require('child_process')
const which = require('which')
const exec = require('../../shared/exec')
const sdk = require('../shared/sdk')
const adb = require('./adb')

const emulator = which.sync('emulator', {
  path: path.join(sdk.path, 'emulator')
})

exports.list = function list (opts) {
  return exec(emulator, ['-list-avds'], opts)
    .split(os.EOL)
    .filter(Boolean)
}

exports.launch = function launch (device, opts = {}) {
  const {
    port = 5554
  } = opts

  childProcess.spawn(emulator, [`@${device}`, '-port', port], {
    detached: true,
    stdio: 'ignore'
  })
    .unref()

  adb.wait(port, opts)

  return `emulator-${port}`
}
