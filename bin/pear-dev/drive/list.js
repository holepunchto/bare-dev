const { createCommand, createArgument } = require('commander')

module.exports = createCommand('list')
  .description('list the entries of a drive')
  .alias('ls')
  .addArgument(
    createArgument('drive')
  )
  .action(action)

function action (drive, _, cmd) {
  return require('../../..').drive.list(drive, cmd.optsWithGlobals())
}
