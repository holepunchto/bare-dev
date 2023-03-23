const path = require('path')
const Hyperdrive = require('hyperdrive')
const Localdrive = require('localdrive')
const id = require('hypercore-id-encoding')

module.exports = async function open (key, opts = {}) {
  const {
    store,
    swarm = null,
    cwd = process.cwd()
  } = opts

  if (!isKey(key)) return new Localdrive(path.resolve(cwd, key))

  const drive = new Hyperdrive(store, id.decode(key))
  await drive.ready()

  if (swarm) {
    swarm.join(drive.discoveryKey)

    const done = store.findingPeers()

    swarm
      .flush()
      .then(done)

    await drive.core.update()
  }

  return drive
}

function isKey (key) {
  return (key.length === 52 || key.length === 64) && key.indexOf(path.sep) === -1 && key.indexOf('.') === -1
}
