const { createCommand } = require('commander')

module.exports = createCommand('device')
  .description('manage iOS devices')
  .addCommand(require('./device/list'))
  .addCommand(require('./device/boot'))
