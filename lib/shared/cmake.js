const which = require('which')

module.exports = function cmake () {
  return which.sync('cmake')
}
