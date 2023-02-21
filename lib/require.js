const path = require('path')
const Module = require('module')

module.exports = function require (name, opts = {}) {
  const {
    cwd = process.cwd()
  } = opts

  const old = process.cwd()
  process.chdir(cwd)
  const module = Module.createRequire(path.join(cwd, 'index.js'))(name)
  process.chdir(old)

  return module
}
