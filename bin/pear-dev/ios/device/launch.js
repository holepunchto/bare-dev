const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('launch')
  .description('launch a device')
  .addArgument(
    createArgument('device', 'the name of the device to launch')
      .argOptional()
  )
  .addOption(
    createOption('--no-open', 'don\'t open Simulator.app after launching the device')
  )
  .action(action)

function action (device, _, cmd) {
  return require('../../../..').ios.device.launch(device, cmd.optsWithGlobals())
}
