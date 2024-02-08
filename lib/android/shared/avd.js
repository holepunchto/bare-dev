const os = require('os')
const path = require('path')
const which = require('which')
const exec = require('../../shared/exec')
const sdk = require('../shared/sdk')

const manager = exports.manager = function manager () {
  return which.sync('avdmanager', {
    path: path.join(sdk.path, 'cmdline-tools/latest/bin')
  })
}

manager.create = function create (name, version, opts = {}) {
  const {
    arch = os.arch(),
    tag = 'default',
    force
  } = opts

  const abi = toABI(arch)

  const pkg = ['system-images', `android-${version}`, tag, abi]

  sdk.manager.install(pkg, opts)

  const args = [
    'create', 'avd',
    '--name', name,
    '--package', pkg.join(';'),
    '--tag', tag,
    '--abi', abi
  ]

  if (force) args.push('--force')

  exec(manager(), args, { ...opts, input: 'no' })
}

manager.remove = function remove (name, opts = {}) {
  exec(manager(), ['delete', 'avd', '--name', name], opts)
}

function toABI (arch) {
  switch (arch) {
    case 'arm64': return 'arm64-v8a'
    case 'arm': return 'armeabi-v7a'
    case 'x64': return 'x86_64'
    case 'ia32': return 'x86'
  }

  throw new Error(`unsupported architecture "${arch}"`)
}
