const which = require('bare-which')

module.exports = function git () {
  return which.sync('git')
}
