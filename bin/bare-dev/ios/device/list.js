const { createCommand } = require('commander')

module.exports = createCommand('list')
  .description('list available devices')
  .alias('ls')
  .action(action)

function action (_, cmd) {
  return require('../../../..').ios.device.list(cmd.optsWithGlobals())
}
