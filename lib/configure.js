const path = require('path')
const spawn = require('./spawn')
const paths = require('./paths')

module.exports = function configure (opts = {}) {
  const {
    source = '.',
    build = 'build',
    platform = process.platform,
    simulator = false,
    generator = null,
    debug = false,
    sanitize = null,
    cwd = process.cwd(),
    quiet = false,
    verbose = false
  } = opts

  const env = { ...process.env }

  const args = [
    '-S', source,
    '-B', path.resolve(cwd, build),
    `-DCMAKE_MODULE_PATH=${paths.cmake}`
  ]

  if (generator !== 'xcode') {
    args.push(`-DCMAKE_BUILD_TYPE=${debug ? 'Debug' : 'Release'}`)
  }

  args.push(`-DCMAKE_SYSTEM_NAME=${toSystem(platform)}`)

  switch (platform) {
    case 'ios':
      args.push(`-DCMAKE_OSX_SYSROOT=iphone${simulator ? 'simulator' : 'os'}`)
  }

  if (generator) {
    args.push('-G', toGenerator(generator))
  }

  if (sanitize === 'address') {
    env.CFLAGS = '-fsanitize=address -fno-omit-frame-pointer'
    env.LDFLAGS = '-fsanitize=address'
  }

  spawn('cmake', args, { quiet, verbose, env, cwd })
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
