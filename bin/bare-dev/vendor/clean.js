const { createCommand, createOption } = require('commander')

module.exports = createCommand('clean')
  .description('remove modifications to vendored dependencies')
  .addOption(
    createOption('--no-submodules', 'don\'t clean git submodules')
  )
  .action(action)

function action (_, cmd) {
  return require('../../..').vendor.clean(cmd.optsWithGlobals())
}
