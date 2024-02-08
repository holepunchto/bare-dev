const path = require('path')
const which = require('which')
const spawn = require('../shared/spawn')

const git = which.sync('git')

module.exports = function sync (opts = {}) {
  const {
    submodules = true,
    cwd = path.resolve('.'),
    quiet = true,
    verbose = false
  } = opts

  if (submodules) {
    spawn(git, ['submodule', 'update', '--init', '--recursive'], { quiet, verbose, cwd })
  }
}
