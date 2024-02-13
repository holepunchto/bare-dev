const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('sync')
  .description('synchronize vendored dependencies')
  .addArgument(
    createArgument('root', 'the root workspace')
      .default('.')
      .argOptional()
  )
  .addOption(
    createOption('--no-submodules', 'don\'t synchronize git submodules')
  )
  .action(action)

function action (root, _, cmd) {
  return require('../../..').vendor.sync(root, cmd.optsWithGlobals())
}
