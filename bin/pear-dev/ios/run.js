const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('run')
  .description('run an app on a device')
  .addArgument(
    createArgument('app', 'the path to the app to run')
  )
  .addArgument(
    createArgument('argv...', 'arguments to pass to the app')
      .argOptional()
      .default([])
  )
  .addOption(
    createOption('-d, --device <name>', 'the device to run the app on')
      .default('booted')
  )
  .addOption(
    createOption('-w, --wait-for-debugger', 'wait for a debugger to attach')
      .default(false)
  )
  .addOption(
    createOption('--no-open', 'don\'t open Simulator.app after booting the device')
  )
  .action(action)

function action (app, argv, _, cmd) {
  return require('../../..').ios.run(app, argv, cmd.optsWithGlobals())
}
