const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('boot')
  .description('boot a device')
  .addArgument(
    createArgument('term', 'the search term of the device to boot')
      .argOptional()
      .default('available')
  )
  .addOption(
    createOption('--no-open', 'don\'t open Simulator.app after booting the device')
  )
  .action(action)

function action (device, _, cmd) {
  return require('../../../..').ios.device.boot(device, cmd.optsWithGlobals())
}
