const path = require('path')
const mod = require('module')

exports.include = path.join(__dirname, 'include')
exports.require = function (name) {
  return mod.createRequire(process.cwd())(name)
}
