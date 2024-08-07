const path = require('path')
const os = require('os')
const which = require('bare-which')
const exec = require('../../shared/exec')
const spawn = require('../../shared/spawn')
const sdk = require('../shared/sdk')
const apkanalyzer = require('./apkanalyzer')

const adb = module.exports = function adb () {
  return which.sync('adb', {
    path: path.join(sdk.path, 'platform-tools')
  })
}

adb.devices = function devices (opts = {}) {
  const lines = exec(adb(), ['devices', '-l'], opts)
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

adb.install = function install (device, apk, opts = {}) {
  const {
    cwd = path.resolve('.')
  } = opts

  if (device === 'number') device = `emulator-${device}`

  apk = path.resolve(cwd, apk)

  spawn(adb(), ['-s', device, 'install', '-r', apk], opts)
}

adb.start = function start (device, apk, opts = {}) {
  const {
    activity = '.MainActivity',
    waitForDebugger = false
  } = opts

  if (device === 'number') device = `emulator-${device}`

  const namespace = apkanalyzer.manifest(apk, 'application-id', opts)

  const args = [
    '-s', device,
    'shell',
    'am',
    'start',
    '-n', `${namespace}/${activity}`,
    '-S'
  ]

  if (waitForDebugger) args.push('-D')

  spawn(adb(), args, opts)
}

adb.wait = function wait (device, opts = {}) {
  const {
    state = 'device'
  } = opts

  if (typeof device === 'number') device = `emulator-${device}`

  spawn(adb(), [
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
    case 'device':
      [name] = exec(adb(), ['-s', device, 'shell', 'getprop', 'ro.product.model'], opts)
        .split(os.EOL)
      break
    case 'emulator':
      [name] = exec(adb(), ['-s', device, 'emu', 'avd', 'name'], opts)
        .split(os.EOL)
  }

  return name.trim()
}
