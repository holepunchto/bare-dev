const { createCommand } = require('commander')

module.exports = createCommand('ios')
  .description('manage iOS')
  .addCommand(require('./ios/device'))
  .addCommand(require('./ios/run'))
