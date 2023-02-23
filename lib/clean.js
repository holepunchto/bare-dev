module.exports = function clean (opts = {}) {
  try {
    require('./build')({ ...opts, target: 'clean' })
  } catch {}
}
