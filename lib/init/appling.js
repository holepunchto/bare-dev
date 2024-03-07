const fs = require('fs/promises')
const path = require('path')

module.exports = async function appling (opts = {}) {
  const {
    force = false,
    cwd = path.resolve('.')
  } = opts

  let {
    name = null,
    key,
    version,
    author,
    description,

    macos,
    windows,
    linux
  } = opts

  if (name === null) {
    const pkg = require(path.join(cwd, 'package.json'))

    name = pkg.name
      .replace(/[^a-z]/ig, '_')
      .replace(/_+/, '_')
      .replace(/^_|_$/, '')
  }

  const definition = path.join(cwd, 'CMakeLists.txt')

  let exists = false
  try {
    await fs.access(definition)
    exists = true
  } catch {}

  if (exists && !force) throw new Error(`refusing to overwrite ${definition}`)

  await fs.writeFile(definition,
`\
cmake_minimum_required(VERSION 3.25)

project(${name} C)

include(pear)

add_pear_appling(
  pear_appling
  NAME "${name}"
  KEY ${key}
  VERSION "${version}"
  AUTHOR "${author}"
  DESCRIPTION "${description}"

  MACOS_IDENTIFIER ${macos.identifier}
  MACOS_CATEGORY ${macos.category}
  MACOS_ENTITLEMENTS ${macos.entitlements.join(' ')}
  MACOS_SIGNING_IDENTITY "${macos.signing.identity}"

  WINDOWS_SIGNING_SUBJECT "${windows.signing.subject}"
  WINDOWS_SIGNING_THUMBPRINT ${windows.signing.thumbprint}

  LINUX_CATEGORY ${linux.category}
)
`
  )
}
