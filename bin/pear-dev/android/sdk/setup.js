const { createCommand, createOption } = require('commander')

module.exports = createCommand('setup')
  .description('setup an Android SDK installation')
  .addOption(
    createOption('--tools <url>', 'url to the SDK command line tools')
  )
  .addOption(
    createOption('--integrity <sha256>', 'integrity digest')
  )
  .addOption(
    createOption('--no-integrity', 'don\'t verify the integrity of the tools package')
  )
  .action(action)

function action (_, cmd) {
  return require('../../../..').android.sdk.setup(cmd.optsWithGlobals())
}
