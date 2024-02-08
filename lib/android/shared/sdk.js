const process = require('process')
const path = require('path')
const os = require('os')
const which = require('which')
const exec = require('../../shared/exec')

exports.path = process.env.ANDROID_HOME || path.join(os.homedir(), '.android/sdk')

const manager = exports.manager = function manager () {
  return which.sync('sdkmanager', {
    path: path.join(exports.path, 'cmdline-tools/latest/bin')
  })
}

manager.install = function install (pkg, version, opts = {}) {
  if (typeof version === 'object') {
    opts = version
    version = null
  }

  pkg = Array.isArray(pkg) ? pkg.join(';') : pkg

  if (version) pkg += `;${version}`

  exec(manager(), ['--install', pkg], opts)
}

manager.uninstall = function install (pkg, version, opts = {}) {
  if (typeof version === 'object') {
    opts = version
    version = null
  }

  pkg = Array.isArray(pkg) ? pkg.join(';') : pkg

  if (version) pkg += `;${version}`

  exec(manager(), ['--uninstall', pkg], opts)
}
