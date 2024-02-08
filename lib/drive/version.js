const process = require('process')
const path = require('path')
const open = require('./shared/open')

module.exports = async function version (drive, opts = {}) {
  const {
    separator = '\n',
    cwd = path.resolve('.'),
    quiet = true
  } = opts

  const store = require('./shared/corestore')(opts)
  const swarm = require('./shared/swarm')(store)

  drive = await open(drive, { store, swarm, cwd })

  if (!quiet) {
    let out = drive.version

    if (/^\s+$/.test(separator)) {
      out += separator
    }

    process.stdout.write(out)
  }

  await swarm.destroy()

  return drive.version
}
