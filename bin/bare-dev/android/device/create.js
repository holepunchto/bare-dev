const os = require('os')
const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('create')
  .description('create an emulator')
  .addArgument(
    createArgument('name', 'the name of the emulator')
  )
  .addArgument(
    createArgument('version', 'the Android API level to target')
  )
  .addOption(
    createOption('-a, --arch <name>', 'the operating system architecture of the emulator')
      .choices(['arm', 'arm64', 'ia32', 'x64'])
      .default(os.arch())
  )
  .addOption(
    createOption('-t, --tag <tag>', 'the tag to target, such as \'android-tv\'')
      .default('default')
  )
  .addOption(
    createOption('-f, --force', 'overwrite any existing emulator with the same name')
      .default(false)
  )
  .action(action)

function action (name, version, _, cmd) {
  return require('../../../..').android.device.create(name, version, cmd.optsWithGlobals())
}
