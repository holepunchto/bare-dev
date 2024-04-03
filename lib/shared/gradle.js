const which = require('bare-which')

module.exports = function gradle () {
  return which.sync('gradle')
}
