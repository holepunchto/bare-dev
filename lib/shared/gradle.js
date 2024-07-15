const path = require('path')
const which = require('bare-which')

module.exports = function gradle (opts = {}) {
  const {
    cwd = path.resolve('.')
  } = opts

  try {
    return which.sync('gradlew', { path: cwd })
  } catch {
    return which.sync('gradle')
  }
}
