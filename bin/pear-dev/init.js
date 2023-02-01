const { createCommand } = require('commander')

module.exports = createCommand('init')
  .description('initialize a build definition')
  .action(action)

function action (_, cmd) {
  const fs = require('fs')
  const path = require('path')

  const options = cmd.optsWithGlobals()

  const { cwd } = options

  const pkg = require(path.join(cwd, 'package.json'))

  const name = pkg.name
    .replace(/[^a-z]/ig, '_')
    .replace(/_+/, '_')
    .replace(/^_|_$/, '')

  fs.writeFileSync(path.join(cwd, 'CMakeLists.txt'), `
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
