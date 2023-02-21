const path = require('path')

const root = path.join(__dirname, '..')

module.exports = {
  include: path.join(root, 'include'),
  cmake: path.join(root, 'cmake')
}
