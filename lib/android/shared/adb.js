const path = require('path')
const os = require('os')
const which = require('which')
const exec = require('../../shared/exec')
const spawn = require('../../shared/spawn')
const sdk = require('../shared/sdk')
const apkanalyzer = require('./apkanalyzer')

const adb = which.sync('adb', {
  path: path.join(sdk.path, 'platform-tools')
})

exports.devices = function devices (opts = {}) {
  const lines = exec(adb, ['devices', '-l'], opts)
    .split(os.EOL)
    .filter(Boolean)
    .slice(1) // Skip header

  const devices = []

  for (const line of lines) {
    const [id, kind] = line
      .split(/[\s,]+/)
      .filter(Boolean)

    if (kind !== 'device') continue

    const type = id.startsWith('emulator-')
      ? 'emulator'
      : 'device'

    devices.push({
      id,
      type,
      name: name(id, { type }),
      state: 'booted'
    })
  }

  return devices
}

exports.install = function install (device, apk, opts = {}) {
  const {
    cwd = process.cwd()
  } = opts

  if (device === 'number') device = `emulator-${device}`

  apk = path.resolve(cwd, apk)

  spawn(adb, ['-s', device, 'install', apk], opts)
}

exports.start = function start (device, apk, opts = {}) {
  const {
    activity = '.MainActivity'
  } = opts

  if (device === 'number') device = `emulator-${device}`

  const namespace = apkanalyzer.manifest(apk, 'application-id', opts)

  spawn(adb, [
    '-s', device,
    'shell',
    'am',
    'start-activity',
    '-S',
    '-n', `${namespace}/${activity}`
  ], opts)
}

exports.wait = function wait (device, opts = {}) {
  const {
    state = 'device'
  } = opts

  if (typeof device === 'number') device = `emulator-${device}`

  spawn(adb, [
    '-s', device,
    `wait-for-${state}`,
    'shell',
    'while [[ -z $(getprop sys.boot_completed) ]]; do sleep 1; done'
  ], opts)
}

function name (device, opts = {}) {
  const {
    type = 'emulator'
  } = opts

  if (typeof device === 'number') device = `emulator-${device}`

  let name

  switch (type) {
    case 'emulator':
      [name] = exec(adb, ['-s', device, 'emu', 'avd', 'name'], opts)
        .split(os.EOL)
  }

  return name.trim()
}
