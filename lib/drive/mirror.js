const open = require('./open')

const symbols = {
  add: '+',
  remove: '-',
  change: '~'
}

module.exports = async function mirror (source, destination, opts = {}) {
  const {
    prefix = '/',
    cwd = process.cwd(),
    quiet = false
  } = opts

  const store = require('./corestore')(opts)
  const swarm = require('./swarm')(store)

  source = await open(source, { store, swarm, cwd })
  destination = await open(destination, { store, swarm, cwd })

  for await (const entry of source.mirror(destination, { prefix })) {
    if (quiet) continue

    process.stdout.write(`${symbols[entry.op]} ${entry.key}\n`)
  }

  await swarm.destroy()
}
