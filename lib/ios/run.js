const path = require('path')
const launch = require('./device/launch')
const simctl = require('./shared/simctl')

module.exports = function run (app, opts = {}) {
  const {
    device = null,
    cwd = process.cwd()
  } = opts

  const id = launch(device, opts)

  app = path.resolve(cwd, app)

  simctl.install(id, app, opts)
  simctl.start(id, app, opts)
}
