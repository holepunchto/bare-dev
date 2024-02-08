const process = require('process')
const path = require('path')
const childProcess = require('child_process')

module.exports = function spawn (cmd, args = [], opts = {}) {
  const {
    env = process.env,
    cwd = path.resolve('.'),
    detached = false,
    quiet = true,
    verbose = false
  } = opts

  if (verbose) {
    if (cwd !== path.resolve('.')) process.stderr.write(`# cd ${cwd}\n`)

    process.stderr.write(`# ${cmd} ${args.join(' ')}\n`)
  }

  let proc

  if (detached) {
    proc = childProcess.spawn(cmd, args, {
      stdio: 'ignore',
      detached,
      env,
      cwd
    })

    proc.unref()
  } else {
    proc = childProcess.spawnSync(cmd, args, {
      stdio: quiet ? 'ignore' : 'inherit',
      env,
      cwd
    })

    if (proc.status) throw new Error('spawn() failed')
  }

  return proc
}
