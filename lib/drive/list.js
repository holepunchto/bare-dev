const process = require('process')
const path = require('path')
const open = require('./shared/open')

module.exports = async function list (drive, opts = {}) {
  const {
    prefix = '/',
    mount = '/',
    checkout,
    separator = '\n',
    cwd = path.resolve('.'),
    quiet = true
  } = opts

  const store = require('./shared/corestore')(opts)
  const swarm = require('./shared/swarm')(store)

  drive = await open(drive, { store, swarm, cwd })

  if (checkout) drive = drive.checkout(checkout)

  const result = []

  let first = true

  for await (const entry of drive.list(prefix)) {
    result.push(entry)

    if (quiet) continue

    let out = path.join(path.resolve(cwd, mount), entry.key)

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
