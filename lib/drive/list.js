const open = require('./open')

module.exports = async function list (drive, opts = {}) {
  const {
    cwd = process.cwd()
  } = opts

  const store = require('./corestore')(opts)
  const swarm = require('./swarm')(store)

  drive = await open(drive, { store, swarm, cwd })

  for await (const entry of drive.list()) {
    process.stdout.write(`${entry.key}\n`)
  }

  await swarm.destroy()
}
