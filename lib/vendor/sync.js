const spawn = require('../spawn')

module.exports = function sync (opts = {}) {
  const {
    submodules = true,
    cwd = process.cwd(),
    quiet = false,
    verbose = false
  } = opts

  if (submodules) {
    const args = ['submodule', 'update', '--init', '--recursive']

    spawn('git', args, { quiet, verbose, cwd })
  }
}
