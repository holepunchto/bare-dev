const childProcess = require('child_process')

module.exports = function exec (file, args = [], opts = {}) {
  const {
    env = process.env,
    cwd = process.cwd(),
    verbose = false
  } = opts

  if (verbose) {
    process.stdout.write(`# cd ${cwd}\n# ${file} ${args.join(' ')}\n`)
  }

  return childProcess.execFileSync(file, args, {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'ignore'],
    env,
    cwd
  })
}
