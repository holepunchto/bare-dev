const fs = require('fs')
const path = require('path')
const mod = require('module')
const childProcess = require('child_process')

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

exports.init = function init (opts = {}) {
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

  if (fs.existsSync(definition) && !force) throw new Error(`refusing to overwrite ${definition}`)

  fs.writeFileSync(definition, `
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
    generator = null,
    debug = false,
    sanitize = null,
    cwd = process.cwd()
  } = opts

  const args = [
    '-S', source,
    '-B', build,
    `-DCMAKE_BUILD_TYPE=${debug ? 'Debug' : 'Release'}`,
    `-DCMAKE_MODULE_PATH=${cmake.modulePath}`
  ]

  if (generator) args.push('-G', generator)

  if (sanitize === 'address') args.push('-DPEAR_ENABLE_ASAN=ON')

  const proc = childProcess.spawnSync('cmake', args, {
    stdio: 'inherit',
    cwd
  })

  if (proc.status) throw new Error('configure() failed')
}

exports.build = function build (opts = {}) {
  const {
    build = 'build',
    target = null,
    verbose = false,
    cwd = process.cwd()
  } = opts

  const args = ['--build', build]

  if (target) args.push('--target', target)

  if (verbose) args.push('--verbose')

  const proc = childProcess.spawnSync('cmake', args, {
    stdio: 'inherit',
    cwd
  })

  if (proc.status) throw new Error('build() failed')
}
