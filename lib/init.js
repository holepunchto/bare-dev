const fs = require('fs/promises')
const path = require('path')

module.exports = async function init (opts = {}) {
  const {
    force = false,
    cwd = path.resolve('.')
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

include(bare)

add_bare_module(${name})

target_sources(
  ${name}
  PRIVATE
    binding.c
)
  `.trim() + '\n')
}
