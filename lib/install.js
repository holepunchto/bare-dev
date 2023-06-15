const fs = require('fs')
const path = require('path')

module.exports = function install (opts = {}) {
  const {
    prebuilds = 'prebuilds',
    platform = process.platform,
    arch = process.arch,
    sync = false,
    cwd = process.cwd()
  } = opts

  if (fs.existsSync(path.resolve(cwd, prebuilds, `${platform}-${arch}`))) return

  if (sync) require('./vendor/sync')(opts)

  require('./rebuild')(opts)
}
