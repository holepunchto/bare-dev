const os = require('os')
const path = require('path')
const which = require('bare-which')
const spawn = require('./shared/spawn')
const cmake = require('./shared/cmake')
const paths = require('./paths')

module.exports = function configure (opts = {}) {
  const {
    source = '.',
    build = 'build',
    platform = os.platform(),
    arch = os.arch(),
    simulator = false,
    cache = true,
    generator = defaultGenerator(platform),
    toolchain = null,
    toolset = null,
    sanitize = null,
    debug = !!sanitize,
    define = [],
    cwd = path.resolve('.'),
    verbose
  } = opts

  const args = [
    '-S', source,
    '-B', path.resolve(cwd, build)
  ]

  if (cache === false) {
    args.push('--fresh')
  }

  if (generator) {
    args.push('-G', toGenerator(generator))
  }

  if (toolchain) {
    args.push('--toolchain', path.resolve(cwd, toolchain))
  }

  if (toolset && generator && supportsToolsetSpecification(generator)) {
    args.push(`-DCMAKE_GENERATOR_TOOLSET=${toToolset(toolset, generator)}`)
  }

  args.push(
    `-DCMAKE_MESSAGE_LOG_LEVEL=${verbose ? 'VERBOSE' : 'NOTICE'}`,

    `-DCMAKE_MODULE_PATH=${cmake.toPath(path.resolve(cwd, 'cmake'))};${cmake.toPath(paths.cmake)}`,

    // Export compile commands for use by external tools, such as the Clangd
    // language server (https://clangd.llvm.org).
    '-DCMAKE_EXPORT_COMPILE_COMMANDS=ON'
  )

  if (generator && supportsMultiConfiguration(generator)) {
    args.push(`-DCMAKE_CONFIGURATION_TYPES=${debug ? 'Debug' : 'Release'}`)
  } else {
    args.push(`-DCMAKE_BUILD_TYPE=${debug ? 'Debug' : 'Release'}`)
  }

  args.push(`-DCMAKE_SYSTEM_NAME=${toSystemName(platform)}`)

  const processor = toSystemProcessor(arch, platform)

  if (platform === 'darwin' || platform === 'ios') {
    args.push(`-DCMAKE_OSX_ARCHITECTURES=${processor}`)
  } else if (platform === 'android') {
    args.push(`-DCMAKE_ANDROID_ARCH_ABI=${
      processor === 'armv7-a'
        ? 'armeabi-v7a'
      : processor === 'aarch64'
        ? 'arm64-v8a'
      : processor === 'i686'
        ? 'x86'
      : processor
    }`)
  } else if (generator && supportsPlatformSpecification(generator)) {
    args.push(`-DCMAKE_GENERATOR_PLATFORM=${processor}`)
  } else {
    args.push(`-DCMAKE_SYSTEM_PROCESSOR=${processor}`)
  }

  args.push(`-DCMAKE_LIBRARY_ARCHITECTURE=${arch}`)

  if (platform === 'darwin') {
    const {
      darwinDeploymentTarget
    } = opts

    if (darwinDeploymentTarget) args.push(`-DCMAKE_OSX_DEPLOYMENT_TARGET=${darwinDeploymentTarget}`)
  }

  if (platform === 'ios') {
    const {
      iosDeploymentTarget
    } = opts

    args.push(`-DCMAKE_OSX_SYSROOT=iphone${simulator ? 'simulator' : 'os'}`)

    if (iosDeploymentTarget) args.push(`-DCMAKE_OSX_DEPLOYMENT_TARGET=${iosDeploymentTarget}`)
  }

  if (platform === 'android') {
    const ndk = require('./android/shared/ndk')

    const {
      androidNdk,
      androidApi,
      androidStl = 'c++_static',
      androidAllowUndefinedSymbols = true
    } = opts

    args.push(`-DCMAKE_ANDROID_NDK=${ndk.path(androidNdk, opts)}`)

    if (androidApi) args.push(`-DCMAKE_ANDROID_API=${androidApi}`)
    if (androidStl) args.push(`-DCMAKE_ANDROID_STL_TYPE=${androidStl}`)
    if (androidAllowUndefinedSymbols) args.push('-DANDROID_ALLOW_UNDEFINED_SYMBOLS=ON')
  }

  if (platform === 'win32' && generator && generator.startsWith('visual-studio')) {
    args.push(`-DCMAKE_MSVC_RUNTIME_LIBRARY=MultiThreaded${debug ? 'Debug' : ''}`)
  }

  const compilerFlags = []
  const linkerFlags = []

  if (debug || sanitize) {
    if (generator && generator.startsWith('visual-studio')) {
      compilerFlags.push('/Oy-')
    } else {
      compilerFlags.push('-fno-omit-frame-pointer')
    }
  }

  if (sanitize) {
    if (generator && generator.startsWith('visual-studio')) {
      compilerFlags.push(`/fsanitize=${sanitize}`)
    } else {
      compilerFlags.push(`-fsanitize=${sanitize}`)
      linkerFlags.push(`-fsanitize=${sanitize}`)
    }
  }

  if (compilerFlags.length) {
    for (const type of ['C']) {
      args.push(`-DCMAKE_${type}_FLAGS=${compilerFlags.join(' ')}`)
    }
  }

  if (linkerFlags.length) {
    for (const type of ['EXE', 'SHARED', 'MODULE']) {
      args.push(`-DCMAKE_${type}_LINKER_FLAGS=${linkerFlags.join(' ')}`)
    }
  }

  for (const entry of define) args.push(`-D${entry}`)

  return spawn(cmake(), args, opts)
}

function supportsMultiConfiguration (generator) {
  return generator === 'xcode' || generator.startsWith('visual-studio')
}

function supportsToolsetSpecification (generator) {
  return generator === 'xcode' || generator.startsWith('visual-studio')
}

function supportsPlatformSpecification (generator) {
  return generator.startsWith('visual-studio')
}

function toGenerator (generator) {
  switch (generator) {
    case 'make':
      return 'Unix Makefiles'
    case 'ninja':
      return 'Ninja'
    case 'xcode':
      return 'Xcode'
    case 'visual-studio-2022':
      return 'Visual Studio 17 2022'
    default:
      throw new Error(`unsupported generator "${generator}"`)
  }
}

function toToolset (toolset, generator) {
  switch (toolset) {
    case 'clang-cl':
      return 'ClangCL'
    default:
      throw new Error(`unsupported toolset "${toolset}" for generator "${generator}"`)
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
      if (platform === 'darwin' || platform === 'ios') return 'arm64'
      if (platform === 'linux') return 'aarch64'
      if (platform === 'android') return 'arm64-v8a'
      if (platform === 'win32') return 'ARM64'
      break

    case 'arm':
      if (platform === 'linux') return 'arm'
      if (platform === 'android') return 'armv7-a'
      break

    case 'x64':
      if (platform === 'darwin' || platform === 'ios' || platform === 'linux' || platform === 'android') return 'x86_64'
      if (platform === 'win32') return 'x64'
      break

    case 'ia32':
      if (platform === 'linux' || platform === 'android') return 'i686'
      if (platform === 'win32') return 'X86'
      break
  }

  throw new Error(`unsupported architecture "${arch}" for platform "${platform}"`)
}

function defaultGenerator (platform) {
  if (platform === 'win32') return 'visual-studio-2022'

  if (has('ninja')) return 'ninja'

  if (platform === 'darwin' || platform === 'ios' || platform === 'linux' || platform === 'android') return 'make'

  return null

  function has (bin) {
    return which.sync(bin, { nothrow: true }) !== null
  }
}
