const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('list')
  .description('list the entries of a drive')
  .alias('ls')
  .addArgument(
    createArgument('drive')
  )
  .addOption(
    createOption('--prefix <path>')
  )
  .addOption(
    createOption('-m, --mount <path>', 'mount the entries at a path')
  )
  .addOption(
    createOption('--checkout <length>', 'checkout a particular version of the drive')
  )
  .addOption(
    createOption('--separator <string>', 'the separator to print between entries')
      .default('\n')
  )
  .action(action)

function action (drive, _, cmd) {
  return require('../../..').drive.list(drive, cmd.optsWithGlobals())
}
