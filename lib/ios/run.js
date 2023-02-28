const path = require('path')
const which = require('which')
const exec = require('../exec')
const spawn = require('../spawn')
const boot = require('./device/boot')

module.exports = function run (app, argv = [], opts = {}) {
  const simctl = require('./xcrun').find('simctl')

  const {
    device = 'booted',
    waitForDebugger = false,
    cwd = process.cwd()
  } = opts

  try { boot(device, opts) } catch { boot('available', opts) }

  app = path.resolve(cwd, app)

  const id = exec(which.sync('defaults'), ['read', path.join(app, 'Info'), 'CFBundleIdentifier'], opts).trim()

  spawn(simctl, ['install', device, app], opts)

  const args = []

  if (waitForDebugger) args.push('--wait-for-debugger')

  spawn(simctl, ['launch', '--console-pty', '--terminate-running-process', ...args, device, id, ...argv], opts)
}
