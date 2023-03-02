const path = require('path')
const which = require('which')
const exec = require('../../shared/exec')
const sdk = require('../shared/sdk')

const apkanalyzer = which.sync('apkanalyzer', {
  path: path.join(sdk.path, 'cmdline-tools/latest/bin')
})

exports.manifest = function manifest (apk, key, opts = {}) {
  const {
    cwd = process.cwd()
  } = opts

  apk = path.resolve(cwd, apk)

  return exec(apkanalyzer, ['manifest', key, apk], opts).trim()
}
