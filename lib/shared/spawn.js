const childProcess = require('child_process')

module.exports = function spawn (cmd, args = [], opts = {}) {
  const {
    env = process.env,
    cwd = process.cwd(),
    quiet = true,
    verbose = false
  } = opts

  if (verbose) {
    if (cwd !== process.cwd()) process.stderr.write(`# cd ${cwd}\n`)

    process.stderr.write(`# ${cmd} ${args.join(' ')}\n`)
  }

  const proc = childProcess.spawnSync(cmd, args, {
    stdio: quiet ? 'ignore' : 'inherit',
    env,
    cwd
  })

  if (proc.status) throw new Error('spawn() failed')

  return proc
}
