const open = require('./open')

const symbols = {
  add: '+',
  remove: '-',
  change: '~'
}

module.exports = async function mirror (source, destination, opts = {}) {
  const {
    prefix = '/',
    separator = '\n',
    cwd = process.cwd(),
    quiet = false
  } = opts

  const store = require('./corestore')(opts)
  const swarm = require('./swarm')(store)

  source = await open(source, { store, swarm, cwd })
  destination = await open(destination, { store, swarm, cwd })

  let first = false

  for await (const entry of source.mirror(destination, { prefix })) {
    if (quiet) continue

    if (first) first = false
    else process.stdout.write(separator)

    process.stdout.write(`${symbols[entry.op]} ${entry.key}`)
  }

  await swarm.destroy()
}
