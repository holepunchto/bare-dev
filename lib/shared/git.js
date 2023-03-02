const which = require('which')

module.exports = function git () {
  return which.sync('git')
}
