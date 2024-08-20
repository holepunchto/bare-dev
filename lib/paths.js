const path = require('path')

const root = path.join(__dirname, '..')
const compat = path.join(root, 'compat')

module.exports = {
  cmake: path.join(root, 'cmake'),

  // Compatibility paths
  'compat/napi': path.join(compat, 'napi')
}
