const path = require('path')
const mod = require('module')

exports.include = path.join(__dirname, 'include')

exports.require = function (name, cwd = process.cwd()) {
  const old = process.cwd()
  process.chdir(cwd)
  const m = mod.createRequire(path.join(cwd, 'index.js'))(name)
  process.chdir(old)
  return m
}

exports.cmake = {
  modulePath: path.join(__dirname, 'cmake')
}
