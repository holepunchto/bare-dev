const { createCommand } = require('commander')

module.exports = createCommand('device')
  .description('manage Android devices and emulators')
  .addCommand(require('./device/list'))
  .addCommand(require('./device/launch'))
  .addCommand(require('./device/create'))
  .addCommand(require('./device/remove'))
