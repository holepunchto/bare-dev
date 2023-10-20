const path = require('path')
const which = require('which')
const exec = require('../../shared/exec')
const spawn = require('../../shared/spawn')
const xcrun = require('./xcrun')

const simctl = module.exports = exports = function simctl () {
  return xcrun.find('simctl')
}

exports.list = function list (opts) {
  const json = JSON.parse(
    exec(simctl(), ['list', '--json', '--no-escape-slashes', 'devices', 'available'], opts)
  )

  return Object.values(json.devices)
    .flatMap((devices) => devices.map((device) => {
      return {
        id: device.udid,
        name: device.name,
        state: device.state.toLowerCase()
      }
    }))
}

exports.launch = function launch (device, opts = {}) {
  const {
    open = false
  } = opts

  spawn(simctl(), ['boot', device], opts)

  if (open) {
    spawn(which.sync('open'), ['-a', 'Simulator.app'], opts)
  }
}

exports.install = function install (device, app, opts = {}) {
  const {
    cwd = process.cwd()
  } = opts

  app = path.resolve(cwd, app)

  spawn(simctl(), ['install', device, app], opts)
}

exports.start = function start (device, app, opts = {}) {
  const {
    attach = false,
    waitForDebugger = false,
    cwd = process.cwd()
  } = opts

  app = path.resolve(cwd, app)

  const id = exec(which.sync('defaults'), ['read', path.join(app, 'Info'), 'CFBundleIdentifier'], opts).trim()

  const args = ['launch', '--terminate-running-process']

  if (attach) args.push('--console-pty')
  if (waitForDebugger) args.push('--wait-for-debugger')

  spawn(simctl(), [...args, device, id], opts)
}
