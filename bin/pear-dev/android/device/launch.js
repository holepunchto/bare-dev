const { createCommand, createArgument } = require('commander')

module.exports = createCommand('launch')
  .description('launch a device')
  .addArgument(
    createArgument('device', 'the name of the device to launch')
      .argOptional()
  )
  .action(action)

function action (device, _, cmd) {
  return require('../../../..').android.device.launch(device, cmd.optsWithGlobals())
}
