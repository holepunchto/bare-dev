const { createCommand } = require('commander')

module.exports = createCommand('list')
  .description('list available devices and emulators')
  .alias('ls')
  .action(action)

function action (_, cmd) {
  return require('../../../..').android.device.list(cmd.optsWithGlobals())
}
