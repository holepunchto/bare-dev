const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('mirror')
  .description('mirror a drive into another')
  .addArgument(
    createArgument('source')
  )
  .addArgument(
    createArgument('destination')
  )
  .addOption(
    createOption('--prefix <path>')
  )
  .action(action)

function action (source, destination, _, cmd) {
  return require('../../..').drive.mirror(source, destination, cmd.optsWithGlobals())
}
