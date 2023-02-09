const fs = require('fs/promises')
const path = require('path')
const mod = require('module')
const childProcess = require('child_process')
const ScriptLinker = require('script-linker')

exports.include = path.join(__dirname, 'include')

exports.require = function (name, cwd = process.cwd()) {
  const old = process.cwd()
  process.chdir(cwd)
  const m = mod.createRequire(path.join(cwd, 'index.js'))(name)
  process.chdir(old)
  return m
}

const cmake = exports.cmake = {
  modulePath: path.join(__dirname, 'cmake')
}

exports.init = async function init (opts = {}) {
  const {
    force = false,
    cwd = process.cwd()
  } = opts

  const pkg = require(path.join(cwd, 'package.json'))

  const name = pkg.name
    .replace(/[^a-z]/ig, '_')
    .replace(/_+/, '_')
    .replace(/^_|_$/, '')

  const definition = path.join(cwd, 'CMakeLists.txt')

  let exists = false
  try {
    await fs.access(definition)
    exists = true
  } catch {}

  if (exists && !force) throw new Error(`refusing to overwrite ${definition}`)

  await fs.writeFile(definition, `
cmake_minimum_required(VERSION 3.25)

project(${name} C)

include(pear)

add_pear_module(${name})

target_sources(
  ${name}
  PRIVATE
    binding.c
)
  `.trim() + '\n')
}

exports.configure = function configure (opts = {}) {
  const {
    source = '.',
    build = 'build',
    platform = process.platform,
    simulator = false,
    generator = null,
    debug = false,
    sanitize = null,
    cwd = process.cwd(),
    quiet = false
  } = opts

  const args = [
    '-S', source,
    '-B', path.resolve(cwd, build),
    `-DCMAKE_MODULE_PATH=${cmake.modulePath}`
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
    args.push('-DPEAR_ENABLE_ASAN=ON')
  }

  const proc = childProcess.spawnSync('cmake', args, {
    stdio: quiet ? null : 'inherit',
    cwd
  })

  if (proc.status) throw new Error('configure() failed')
}

exports.build = function build (opts = {}) {
  const {
    build = 'build',
    target = null,
    verbose = false,
    cwd = process.cwd(),
    quiet = false
  } = opts

  const args = ['--build', path.resolve(cwd, build)]

  if (target) args.push('--target', target)

  if (verbose) args.push('--verbose')

  const proc = childProcess.spawnSync('cmake', args, {
    stdio: quiet ? null : 'inherit',
    cwd
  })

  if (proc.status) throw new Error('build() failed')
}

exports.prebuild = function prebuild (opts = {}) {
  const {
    build = 'build',
    prebuilds = 'prebuilds',
    cwd = process.cwd(),
    quiet = false
  } = opts

  exports.build(opts)

  const args = [
    '--install', path.resolve(cwd, build),
    '--prefix', path.resolve(cwd, prebuilds)
  ]

  const proc = childProcess.spawnSync('cmake', args, {
    stdio: quiet ? null : 'inherit',
    cwd
  })

  if (proc.status) throw new Error('prebuild() failed')
}

exports.clean = function clean (opts = {}) {
  exports.build({ ...opts, target: 'clean' })
}

exports.rebuild = function clean (opts = {}) {
  try {
    exports.clean({ ...opts, quiet: true })
  } catch {}

  exports.configure(opts)
  exports.build(opts)
}

exports.link = async function link (entry, opts = {}) {
  const {
    out = null,
    print = false,
    indent = 2,
    cwd = process.cwd()
  } = opts

  const linker = new ScriptLinker({
    bare: true,

    readFile (filename) {
      return fs.readFile(path.join(cwd, filename))
    }
  })

  const files = Object.create(null)

  entry = path.resolve('/', path.relative(cwd, entry))

  for await (const { module } of linker.dependencies(entry)) {
    if (module.builtin) continue

    if (module.package) {
      files[module.packageFilename] = {
        source: JSON.stringify(module.package)
      }
    }

    files[module.filename] = {
      source: module.source
    }
  }

  const manifest = {
    files
  }

  if (print || out) {
    const json = JSON.stringify(manifest, null, indent) + '\n'

    if (print) {
      process.stdout.write(json)
    }

    if (out) {
      await fs.writeFile(path.resolve(cwd, out), json)
    }
  }

  return manifest
}

exports.bundle = async function bundle (entry, opts = {}) {
  const {
    protocol = 'app',
    out = null,
    print = false,
    cwd = process.cwd()
  } = opts

  const linker = new ScriptLinker({
    bare: true,
    protocol,

    readFile (filename) {
      return fs.readFile(path.join(cwd, filename))
    }
  })

  entry = path.resolve('/', path.relative(cwd, entry))

  const code = await linker.bundle(entry)

  if (print) {
    process.stdout.write(code)
  }

  if (out) {
    await fs.writeFile(path.resolve(cwd, out), code)
  }
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
