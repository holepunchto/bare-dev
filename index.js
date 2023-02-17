const fs = require('fs/promises')
const path = require('path')
const Module = require('module')
const childProcess = require('child_process')
const ScriptLinker = require('script-linker')
const includeStatic = require('include-static')
const Bundle = require('@pearjs/bundle')

const paths = exports.paths = {
  include: path.join(__dirname, 'include'),
  cmake: path.join(__dirname, 'cmake')
}

exports.require = function require (name, opts = {}) {
  const {
    cwd = process.cwd()
  } = opts

  const old = process.cwd()
  process.chdir(cwd)
  const module = Module.createRequire(path.join(cwd, 'index.js'))(name)
  process.chdir(old)

  return module
}

exports.sync = function sync (opts = {}) {
  const {
    submodules = true,
    cwd = process.cwd(),
    quiet = false,
    verbose = false
  } = opts

  if (submodules) {
    const args = ['submodule', 'update', '--init', '--recursive']

    spawn('git', args, { quiet, verbose, cwd })
  }
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

exports.build = function build (opts = {}) {
  const {
    build = 'build',
    target = null,
    cwd = process.cwd(),
    quiet = false,
    verbose = false
  } = opts

  const args = ['--build', path.resolve(cwd, build)]

  if (target) args.push('--target', target)

  if (verbose) args.push('--verbose')

  spawn('cmake', args, { quiet, verbose, cwd })
}

exports.prebuild = function prebuild (opts = {}) {
  const {
    build = 'build',
    prebuilds = 'prebuilds',
    cwd = process.cwd(),
    quiet = false,
    verbose = false
  } = opts

  exports.build(opts)

  const args = [
    '--install', path.resolve(cwd, build),
    '--prefix', path.resolve(cwd, prebuilds)
  ]

  spawn('cmake', args, { quiet, verbose, cwd })
}

exports.clean = function clean (opts = {}) {
  exports.build({ ...opts, target: 'clean' })
}

exports.test = function clean (opts = {}) {
  exports.build({ ...opts, target: null })
  exports.build({ ...opts, target: 'test' })
}

exports.rebuild = function clean (opts = {}) {
  try {
    exports.clean({ ...opts, quiet: true })
  } catch {}

  exports.configure(opts)
  exports.build(opts)
}

exports.bundle = async function link (entry, opts = {}) {
  const {
    config = null,
    cwd = process.cwd()
  } = opts

  if (config) {
    opts = {
      ...opts,
      ...require(path.resolve(cwd, config))
    }
  }

  const {
    protocol = 'app',
    format = 'bundle',
    target = 'js',
    name = 'bundle',
    imports = {},
    importMap = null,
    header = '',
    footer = '',
    out = null,
    print = false,
    indent = 2
  } = opts

  if (importMap) {
    const map = require(path.resolve(cwd, importMap))

    for (const [from, to] of Object.entries(map.imports)) {
      imports[from] = to
    }
  }

  const linker = new ScriptLinker({
    bare: true,
    protocol,

    map (id, { protocol }) {
      return `${protocol}:${path.relative('/', id)}`
    },

    mapResolve (id) {
      if (id in imports) id = imports[id]
      return id
    },

    readFile (filename) {
      return fs.readFile(path.join(cwd, filename))
    },

    builtins: {
      has () {
        return false
      },
      async get () {
        return null
      },
      keys () {
        return []
      }
    }
  })

  entry = path.resolve('/', path.relative(cwd, entry))

  let data

  switch (format) {
    case 'bundle': {
      const bundle = new Bundle()

      for (const [from, to] of Object.entries(imports)) {
        bundle.imports[from] = to
      }

      for await (const { module } of linker.dependencies(entry)) {
        if (module.builtin) continue

        if (module.package) {
          const source = JSON.stringify(module.package, null, indent)

          bundle.write(module.packageFilename, source + '\n')
        }

        bundle.write(module.filename, module.source, {
          main: module.filename === entry
        })
      }

      data = bundle.toBuffer({ indent })
      break
    }

    case 'js':
      data = Buffer.from(await linker.bundle(entry, { header, footer }))
      break

    default:
      throw new Error(`unknown format "${format}"`)
  }

  switch (target) {
    case 'js':
      break

    case 'c':
      data = includeStatic(name, data)
      break

    default:
      throw new Error(`unknown target "${format}"`)
  }

  if (print || out) {
    if (print) {
      process.stdout.write(data)
    }

    if (out) {
      await fs.writeFile(path.resolve(cwd, out), data)
    }
  }

  return data
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

function spawn (cmd, args = [], opts = {}) {
  const {
    env = process.env,
    quiet = false,
    verbose = true,
    cwd = process.cwd()
  } = opts

  if (verbose) {
    process.stdout.write(`# cd ${cwd}\n# ${cmd} ${args.join(' ')}\n`)
  }

  const proc = childProcess.spawnSync(cmd, args, {
    stdio: quiet ? null : 'inherit',
    env,
    cwd
  })

  if (proc.status) throw new Error('spawn() failed')
}
