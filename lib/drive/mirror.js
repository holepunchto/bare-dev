const open = require('./shared/open')

const symbols = {
  add: '+',
  remove: '-',
  change: '~'
}

module.exports = async function mirror (source, destination, opts = {}) {
  const {
    prefix = '/',
    prune = false,
    separator = '\n',
    cwd = process.cwd(),
    quiet = true
  } = opts

  const store = require('./shared/corestore')(opts)
  const swarm = require('./shared/swarm')(store)

  source = await open(source, { store, swarm, cwd })
  destination = await open(destination, { store, swarm, cwd })

  const result = []

  let first = false

  for await (const entry of source.mirror(destination, { prefix, prune })) {
    result.push(entry)

    if (quiet) continue

    let out = `${symbols[entry.op]} ${entry.key}`

    if (/^\s+$/.test(separator)) {
      out += separator
    } else {
      first ? first = false : out = separator + out
    }

    process.stdout.write(out)
  }

  await swarm.destroy()

  return result
}
