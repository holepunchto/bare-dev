const { createCommand } = require('commander')

module.exports = createCommand('sdk')
  .description('manage the Android SDK')
  .addCommand(require('./sdk/setup'))
