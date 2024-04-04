const path = require('path')
const which = require('bare-which')
const spawn = require('../shared/spawn')

const git = which.sync('git')

module.exports = function sync (root = '.', opts = {}) {
  const {
    submodules = true,
    cwd = path.resolve('.'),
    quiet = true,
    verbose = false
  } = opts

  if (submodules) {
    spawn(git, ['submodule', 'update', '--init', '--recursive', root], { quiet, verbose, cwd })
  }
}
