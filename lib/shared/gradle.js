const which = require('which')

module.exports = function gradle () {
  return which.sync('gradle')
}
