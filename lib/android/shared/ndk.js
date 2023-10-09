const glob = require('glob')
const sdk = require('./sdk')

exports.path = function path (version = 'installed', opts = {}) {
  const path = require('path')

  switch (version) {
    case 'installed': {
      const candidates = glob.globSync(path.join(sdk.path, 'ndk', '*'), {
        windowsPathsNoEscape: true
      })

      if (candidates.length === 0) throw new Error('no Android NDK installed')

      return candidates[0]
    }

    default:
      sdk.manager.install('ndk', version, opts)

      return path.join(sdk.path, 'ndk', version)
  }
}
