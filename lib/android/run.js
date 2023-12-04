const path = require('path')
const { globSync } = require('glob')
const launch = require('./device/launch')
const adb = require('./shared/adb')

module.exports = function run (apk, opts = {}) {
  const {
    device = null,
    cwd = process.cwd()
  } = opts

  if (apk === null) {
    [apk = null] = globSync(path.join(cwd, '**/*.apk'), {
      ignore: [
        '**/vendor/**',

        // Ignore unsigned packages
        '**/*-unsigned.apk'
      ]
    })

    if (apk === null) {
      throw new Error('no .apk found')
    }
  }

  const id = launch(device, opts)

  apk = path.resolve(cwd, apk)

  adb.install(id, apk, opts)
  adb.start(id, apk, opts)
}
