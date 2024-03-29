const process = require('process')
const path = require('path')
const childProcess = require('child_process')

module.exports = function exec (file, args = [], opts = {}) {
  const {
    env = process.env,
    cwd = path.resolve('.'),
    input,
    verbose = false
  } = opts

  if (verbose) {
    if (cwd !== path.resolve('.')) process.stderr.write(`# cd ${cwd}\n`)

    process.stderr.write(`# ${file} ${args.join(' ')}\n`)
  }

  return childProcess.execFileSync(file, args, {
    encoding: 'utf-8',
    stdio: [input ? null : 'ignore', 'pipe', 'ignore'],
    env,
    cwd,
    input
  })
}
