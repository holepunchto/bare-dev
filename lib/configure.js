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
    arch = process.arch,
    simulator = false,
    generator = defaultGenerator(),
    sanitize = null,
    debug = !!sanitize,
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
    '-DCMAKE_MESSAGE_LOG_LEVEL=NOTICE',

    `-DCMAKE_MODULE_PATH=${cmake.toPath(paths.cmake)}`,

    // Export compile commands for use by external tools, such as the Clangd
    // language server (https://clangd.llvm.org).
    '-DCMAKE_EXPORT_COMPILE_COMMANDS=ON'
  )

  if (generator !== 'xcode') {
    args.push(`-DCMAKE_BUILD_TYPE=${debug ? 'Debug' : 'Release'}`)
  }

  if (platform !== process.platform) {
    args.push(`-DCMAKE_SYSTEM_NAME=${toSystemName(platform)}`)
  }

  if (arch !== process.arch) {
    let arg = 'CMAKE_SYSTEM_PROCESSOR'

    if (platform === 'darwin' || platform === 'ios') {
      arg = 'CMAKE_OSX_ARCHITECTURES'
    }

    args.push(`-D${arg}=${toSystemProcessor(arch, platform)}`)
  }

  switch (platform) {
    case 'ios':
      args.push(`-DCMAKE_OSX_SYSROOT=iphone${simulator ? 'simulator' : 'os'}`)
  }

  for (const entry of define) args.push(`-D${entry}`)

  if (sanitize === 'address' || sanitize === 'thread') {
    env.CFLAGS = `-fsanitize=${sanitize} -fno-omit-frame-pointer`
    env.LDFLAGS = `-fsanitize=${sanitize}`
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
      throw new Error(`unsupported generator "${generator}"`)
  }
}

function toSystemName (platform) {
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
      throw new Error(`unsupported platform "${platform}"`)
  }
}

function toSystemProcessor (arch, platform) {
  switch (arch) {
    case 'arm64':
      if (platform === 'darwin' || platform === 'ios') return arch
      if (platform === 'linux' || platform === 'android') return 'aarch64'
      if (platform === 'win32') return 'ARM64'
      break

    case 'arm':
      if (platform === 'linux' || platform === 'android') return arch
      break

    case 'x64':
      if (platform === 'darwin' || platform === 'ios' || platform === 'linux' || platform === 'android') return 'x86_64'
      if (platform === 'win32') return 'AMD64'
      break

    case 'ia32':
      if (platform === 'linux' || platform === 'android') return 'i386'
      if (platform === 'win32') return 'X86'
      break
  }

  throw new Error(`unsupported architecture "${arch}" for platform "${platform}"`)
}

function defaultGenerator () {
  if (has('ninja')) return 'ninja'

  return null

  function has (bin) {
    return which.sync(bin, { nothrow: true }) !== null
  }
}
