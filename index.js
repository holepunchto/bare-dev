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
  const pkg = require(path.join(opts.cwd, 'package.json'))

  const name = pkg.name
    .replace(/[^a-z]/ig, '_')
    .replace(/_+/, '_')
    .replace(/^_|_$/, '')

  fs.writeFileSync(path.join(opts.cwd, 'CMakeLists.txt'), `
cmake_minimum_required(VERSION 3.25)

project(${name} C)

include(pear)

add_pear_module(${name})

target_sources(
  ${name}
  PUBLIC
    binding.c
)
  `.trim() + '\n')
}

exports.configure = function configure (opts = {}) {
  const args = [
    '-S', opts.source,
    '-B', opts.build,
    `-DCMAKE_BUILD_TYPE=${opts.debug ? 'Debug' : 'Release'}`,
    `-DCMAKE_MODULE_PATH=${cmake.modulePath}`
  ]

  if (opts.debug) args.push('-DPEAR_ENABLE_ASAN=ON')

  const proc = childProcess.spawnSync('cmake', args, {
    stdio: 'inherit',
    cwd: opts.cwd
  })

  if (proc.status) throw new Error('configure() failed')
}

exports.build = function build (opts = {}) {
  const args = ['--build', opts.build]

  if (opts.verbose) args.push('--verbose')

  const proc = childProcess.spawnSync('cmake', args, {
    stdio: 'inherit',
    cwd: opts.cwd
  })

  if (proc.status) throw new Error('build() failed')
}
