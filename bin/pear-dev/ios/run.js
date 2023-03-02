const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('run')
  .description('run an app on a device')
  .addArgument(
    createArgument('app', 'the path to the app to run')
      .argOptional()
  )
  .addOption(
    createOption('-d, --device <name>', 'the device to run the app on')
  )
  .addOption(
    createOption('--no-open', 'don\'t open Simulator.app after launching the device')
  )
  .action(action)

function action (app = null, _, cmd) {
  return require('../../..').ios.run(app, cmd.optsWithGlobals())
}
