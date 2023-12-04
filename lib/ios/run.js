const path = require('path')
const { globSync } = require('glob')
const launch = require('./device/launch')
const simctl = require('./shared/simctl')

module.exports = function run (app = null, opts = {}) {
  const {
    device = null,
    cwd = process.cwd()
  } = opts

  if (app === null) {
    [app = null] = globSync(path.join(cwd, '**/*.app'), {
      ignore: [
        '**/vendor/**'
      ]
    })

    if (app === null) {
      throw new Error('no .app found')
    }
  }

  const id = launch(device, opts)

  app = path.resolve(cwd, app)

  simctl.install(id, app, opts)
  simctl.start(id, app, opts)
}
