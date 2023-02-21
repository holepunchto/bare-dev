const build = require('./build')

module.exports = function clean (opts = {}) {
  try { build({ ...opts, target: 'clean' }) } catch {}
}
