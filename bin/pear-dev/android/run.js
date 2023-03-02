const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('run')
  .description('run an apk on a device')
  .addArgument(
    createArgument('apk', 'the path to the apk to run')
      .argOptional()
  )
  .addOption(
    createOption('-d, --device <name>', 'the device to run the app on')
  )
  .addOption(
    createOption('-w, --wait-for-debugger', 'wait for a debugger to attach')
      .default(false)
  )
  .action(action)

function action (apk = null, _, cmd) {
  return require('../../..').android.run(apk, cmd.optsWithGlobals())
}
