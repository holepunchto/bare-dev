const process = require('process')
const path = require('path')
const childProcess = require('child_process')

module.exports = function spawn (cmd, args = [], opts = {}) {
  const {
    env = process.env,
    cwd = path.resolve('.'),
    detached = false,
    quiet = true,
    stdio = quiet || detached ? 'ignore' : 'inherit',
    shell = requiresShell(cmd),
    verbose = false
  } = opts

  if (verbose) {
    if (cwd !== path.resolve('.')) process.stderr.write(`# cd ${cwd}\n`)

    process.stderr.write(`# ${cmd} ${args.join(' ')}\n`)
  }

  let proc

  if (detached) {
    proc = childProcess.spawn(cmd, args, {
      stdio,
      detached,
      env,
      cwd,
      shell
    })

    proc.unref()
  } else {
    proc = childProcess.spawnSync(cmd, args, {
      stdio,
      env,
      cwd,
      shell
    })

    if (proc.status) throw new Error('spawn() failed')
  }

  return proc
}

function requiresShell (cmd) {
  if (process.platform !== 'win32') return false

  const ext = path.extname(cmd).toLowerCase()

  return ext === '.bat' || ext === '.cmd'
}
