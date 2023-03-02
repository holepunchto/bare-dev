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
    const args = ['submodule', 'update', '--init', '--recursive']

    spawn(git, args, { quiet, verbose, cwd })
  }
}
