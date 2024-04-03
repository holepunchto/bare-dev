const path = require('path')
const which = require('bare-which')
const spawn = require('../shared/spawn')
const sync = require('./sync')

const git = which.sync('git')

module.exports = function checkout (root, version, opts = {}) {
  const {
    submodules = true,
    cwd = path.resolve('.'),
    quiet = true,
    verbose = false
  } = opts

  if (submodules) {
    spawn(git, ['-C', root, 'fetch'], { quiet, verbose, cwd })

    spawn(git, ['-C', root, 'checkout', '--force', version], { quiet, verbose, cwd })

    spawn(git, ['stage', root], { quiet, verbose, cwd })
  }

  sync(root, opts)
}
