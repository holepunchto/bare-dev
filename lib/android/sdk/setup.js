const fs = require('fs')
const os = require('os')
const process = require('process')
const path = require('path')
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

  const destination = path.join(sdk, 'cmdline-tools/latest')

  if (!fs.existsSync(destination) || force) {
    const response = await fetch(tools)

    const input = Buffer.from(await response.arrayBuffer())

    const digest = crypto.createHash('sha256')
      .update(input)
      .digest('hex')

    if (integrity && digest !== integrity) throw new Error('integrity mismatch')

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
  const release = '11076708'

  switch (os.platform()) {
    case 'darwin':
      return {
        tools: `https://dl.google.com/android/repository/commandlinetools-mac-${release}_latest.zip`,
        integrity: '7bc5c72ba0275c80a8f19684fb92793b83a6b5c94d4d179fc5988930282d7e64'
      }

    case 'linux':
      return {
        tools: `https://dl.google.com/android/repository/commandlinetools-linux-${release}_latest.zip`,
        integrity: '2d2d50857e4eb553af5a6dc3ad507a17adf43d115264b1afc116f95c92e5e258'
      }

    case 'win32':
      return {
        tools: `https://dl.google.com/android/repository/commandlinetools-win-${release}_latest.zip`,
        integrity: '4d6931209eebb1bfb7c7e8b240a6a3cb3ab24479ea294f3539429574b1eec862'
      }

    default:
      throw new Error(`unsupported platform ${os.platform()}`)
  }
}
