const path = require('path')
const open = require('./open')

module.exports = async function list (drive, opts = {}) {
  const {
    prefix = '/',
    mount = '/',
    separator = '\n',
    cwd = process.cwd()
  } = opts

  const store = require('./corestore')(opts)
  const swarm = require('./swarm')(store)

  drive = await open(drive, { store, swarm, cwd })

  let first = true

  for await (const entry of drive.list(prefix)) {
    let out = `${path.join(path.resolve(cwd, mount), entry.key)}`

    if (/^\s+$/.test(separator)) {
      out += separator
    } else {
      first ? first = false : out = separator + out
    }

    process.stdout.write(out)
  }

  await swarm.destroy()
}
