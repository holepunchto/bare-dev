const childProcess = require('child_process')

module.exports = function exec (file, args = [], opts = {}) {
  const {
    env = process.env,
    cwd = process.cwd(),
    verbose = false
  } = opts

  if (verbose) {
    if (cwd !== process.cwd()) process.stderr.write(`# cd ${cwd}\n`)

    process.stderr.write(`# ${file} ${args.join(' ')}\n`)
  }

  return childProcess.execFileSync(file, args, {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'ignore'],
    env,
    cwd
  })
}
