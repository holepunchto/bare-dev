const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('clean')
  .description('remove modifications to vendored dependencies')
  .addArgument(
    createArgument('root', 'the root workspace')
      .default('.')
      .argOptional()
  )
  .addOption(
    createOption('--no-submodules', 'don\'t clean git submodules')
  )
  .action(action)

function action (root, _, cmd) {
  return require('../../..').vendor.clean(root, cmd.optsWithGlobals())
}
