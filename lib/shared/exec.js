const process = require('process')
const path = require('path')
const childProcess = require('child_process')

module.exports = function exec (file, args = [], opts = {}) {
  const {
    env = process.env,
    cwd = path.resolve('.'),
    input,
    quiet = true,
    stdio = [input ? null : 'ignore', 'pipe', quiet ? 'ignore' : 'inherit'],
    shell = requiresShell(file),
    verbose = false
  } = opts

  if (verbose) {
    if (cwd !== path.resolve('.')) process.stderr.write(`# cd ${cwd}\n`)

    process.stderr.write(`# ${file} ${args.join(' ')}\n`)
  }

  return childProcess.execFileSync(file, args, {
    encoding: 'utf-8',
    stdio,
    env,
    cwd,
    input,
    shell
  })
}

function requiresShell (cmd) {
  if (process.platform !== 'win32') return false

  const ext = path.extname(cmd).toLowerCase()

  return ext === '.bat' || ext === '.cmd'
}
