const which = require('which')
const spawn = require('../shared/spawn')

const git = which.sync('git')

module.exports = function sync (opts = {}) {
  const {
    submodules = true,
    cwd = process.cwd(),
    quiet = true,
    verbose = false
  } = opts

  if (submodules) {
    spawn(git, ['submodule', 'deinit', '--force', '.'], { quiet, verbose, cwd })
  }
}
