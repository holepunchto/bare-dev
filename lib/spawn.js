const childProcess = require('child_process')

module.exports = function spawn (cmd, args = [], opts = {}) {
  const {
    env = process.env,
    quiet = false,
    verbose = true,
    cwd = process.cwd()
  } = opts

  if (verbose) {
    process.stdout.write(`# cd ${cwd}\n# ${cmd} ${args.join(' ')}\n`)
  }

  const proc = childProcess.spawnSync(cmd, args, {
    stdio: quiet ? null : 'inherit',
    env,
    cwd
  })

  if (proc.status) throw new Error('spawn() failed')
}
