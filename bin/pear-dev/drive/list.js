const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('list')
  .description('list the entries of a drive')
  .alias('ls')
  .addArgument(
    createArgument('drive')
  )
  .addOption(
    createOption('-m, --mount <path>', 'mount the entries at a path')
  )
  .action(action)

function action (drive, _, cmd) {
  return require('../../..').drive.list(drive, cmd.optsWithGlobals())
}
