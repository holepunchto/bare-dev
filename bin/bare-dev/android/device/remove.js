const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('remove')
  .description('remove an emulator')
  .addArgument(
    createArgument('name', 'the name of the emulator to remove')
  )
  .action(action)

function action (name, _, cmd) {
  return require('../../../..').android.device.remove(name, cmd.optsWithGlobals())
}
