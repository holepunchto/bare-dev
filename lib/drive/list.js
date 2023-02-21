const path = require('path')
const open = require('./open')

module.exports = async function list (drive, opts = {}) {
  const {
    mount = '/',
    cwd = process.cwd()
  } = opts

  const store = require('./corestore')(opts)
  const swarm = require('./swarm')(store)

  drive = await open(drive, { store, swarm, cwd })

  for await (const entry of drive.list()) {
    process.stdout.write(`${path.join(path.resolve(cwd, mount), entry.key)}\n`)
  }

  await swarm.destroy()
}
