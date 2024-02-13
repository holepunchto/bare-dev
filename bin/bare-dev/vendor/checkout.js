const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('checkout')
  .description('check out a different version of a vendored dependency')
  .addArgument(
    createArgument('root', 'the root workspace')
  )
  .addArgument(
    createArgument('version', 'the version to check out')
  )
  .addOption(
    createOption('--no-submodules', 'don\'t update git submodules')
  )
  .action(action)

function action (root, version, _, cmd) {
  return require('../../..').vendor.checkout(root, version, cmd.optsWithGlobals())
}
