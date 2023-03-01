const path = require('path')
const os = require('os')
const fs = require('fs')
const crypto = require('crypto')
const decompress = require('decompress')

module.exports = async function setup (opts = {}) {
  const {
    sdk = path.join(os.homedir(), '.android/sdk'),
    tools = defaults().tools,
    integrity = defaults().integrity,
    force = false,
    quiet = true
  } = opts

  if (!fs.existsSync(sdk) || force) {
    const response = await fetch(tools)

    const input = Buffer.from(await response.arrayBuffer())

    const digest = crypto.createHash('sha256')
      .update(input)
      .digest('hex')

    if (integrity && digest !== integrity) throw new Error('integrity mismatch')

    const destination = path.join(sdk, 'cmdline-tools/latest')

    await decompress(input, destination, {
      map (file) {
        file.path = path.relative('cmdline-tools', file.path)
        return file
      }
    })
  }

  if (!quiet) process.stdout.write(`export ANDROID_HOME=${sdk}\n`)
}

function defaults () {
  const release = '9477386'

  switch (process.platform) {
    case 'darwin':
      return {
        tools: `https://dl.google.com/android/repository/commandlinetools-mac-${release}_latest.zip`,
        integrity: '2072ffce4f54cdc0e6d2074d2f381e7e579b7d63e915c220b96a7db95b2900ee'
      }

    case 'linux':
      return {
        tools: `https://dl.google.com/android/repository/commandlinetools-linux-${release}_latest.zip`,
        integrity: 'bd1aa17c7ef10066949c88dc6c9c8d536be27f992a1f3b5a584f9bd2ba5646a0'
      }

    case 'win32':
      return {
        tools: `https://dl.google.com/android/repository/commandlinetools-win-${release}_latest.zip`,
        integrity: '696431978daadd33a28841320659835ba8db8080a535b8f35e9e60701ab8b491'
      }

    default:
      throw new Error(`unsupported platform ${process.platform}`)
  }
}
