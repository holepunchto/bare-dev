const { createCommand } = require('commander')

module.exports = createCommand('vendor')
  .description('manage vendored dependencies')
  .addCommand(require('./vendor/sync'))
  .addCommand(require('./vendor/clean'))
