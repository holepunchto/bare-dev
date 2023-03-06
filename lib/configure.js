const path = require('path')
const which = require('which')
const spawn = require('./shared/spawn')
const cmake = require('./shared/cmake')
const paths = require('./paths')

module.exports = function configure (opts = {}) {
  const {
    source = '.',
    build = 'build',
    platform = process.platform,
    simulator = false,
    generator = defaultGenerator(),
    debug = false,
    sanitize = null,
    define = [],
    cwd = process.cwd()
  } = opts

  const env = { ...process.env }

  const args = [
    '-S', source,
    '-B', path.resolve(cwd, build)
  ]

  if (generator) {
    args.push('-G', toGenerator(generator))
  }

  args.push(
    `-DCMAKE_MODULE_PATH=${paths.cmake}`,

    // Export compile commands for use by external tools, such as the Clangd
    // language server (https://clangd.llvm.org).
    '-DCMAKE_EXPORT_COMPILE_COMMANDS=ON'
  )

  if (generator !== 'xcode') {
    args.push(`-DCMAKE_BUILD_TYPE=${debug ? 'Debug' : 'Release'}`)
  }

  args.push(`-DCMAKE_SYSTEM_NAME=${toSystem(platform)}`)

  switch (platform) {
    case 'ios':
      args.push(`-DCMAKE_OSX_SYSROOT=iphone${simulator ? 'simulator' : 'os'}`)
  }

  for (const entry of define) args.push(`-D${entry}`)

  if (sanitize === 'address') {
    env.CFLAGS = '-fsanitize=address -fno-omit-frame-pointer'
    env.LDFLAGS = '-fsanitize=address'
  }

  spawn(cmake(), args, { ...opts, env })
}

function toGenerator (generator) {
  switch (generator) {
    case 'make':
      return 'Unix Makefiles'
    case 'ninja':
      return 'Ninja'
    case 'xcode':
      return 'Xcode'
    default:
      throw new Error(`unknown generator "${generator}"`)
  }
}

function toSystem (platform) {
  switch (platform) {
    case 'darwin':
      return 'Darwin'
    case 'ios':
      return 'iOS'
    case 'linux':
      return 'Linux'
    case 'android':
      return 'Android'
    case 'win32':
      return 'Windows'
    default:
      throw new Error(`unknown platform "${platform}"`)
  }
}

function defaultGenerator () {
  if (has('ninja')) return 'ninja'

  return null

  function has (bin) {
    return which.sync(bin, { nothrow: true }) !== null
  }
}
