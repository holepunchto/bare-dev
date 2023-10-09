const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const decompress = require('decompress')

module.exports = async function setup (opts = {}) {
  const {
    sdk = require('../shared/sdk').path,
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
  const release = '10406996'

  switch (process.platform) {
    case 'darwin':
      return {
        tools: `https://dl.google.com/android/repository/commandlinetools-mac-${release}_latest.zip`,
        integrity: '6821609e885d4b68f4066751949a9211f4196ab36df9d63f7a5f9037ca64e2d6'
      }

    case 'linux':
      return {
        tools: `https://dl.google.com/android/repository/commandlinetools-linux-${release}_latest.zip`,
        integrity: '8919e8752979db73d8321e9babe2caedcc393750817c1a5f56c128ec442fb540'
      }

    case 'win32':
      return {
        tools: `https://dl.google.com/android/repository/commandlinetools-win-${release}_latest.zip`,
        integrity: '9b782a54d246ba5d207110fddd1a35a91087a8aaf4057e9df697b1cbc0ef60fc'
      }

    default:
      throw new Error(`unsupported platform ${process.platform}`)
  }
}
