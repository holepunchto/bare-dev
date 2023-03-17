const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('version')
  .description('get the current version of a drive')
  .addArgument(
    createArgument('drive')
  )
  .addOption(
    createOption('--separator <string>')
      .default('\n')
  )
  .action(action)

function action (drive, _, cmd) {
  return require('../../..').drive.version(drive, cmd.optsWithGlobals())
}
