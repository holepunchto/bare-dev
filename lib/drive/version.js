const open = require('./shared/open')

module.exports = async function version (drive, opts = {}) {
  const {
    separator = '\n',
    cwd = process.cwd(),
    quiet = true
  } = opts

  const store = require('./shared/corestore')(opts)
  const swarm = require('./shared/swarm')(store)

  drive = await open(drive, { store, swarm, cwd })

  await drive.download('/', { recursive: true })

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