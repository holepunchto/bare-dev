const { createCommand, createOption } = require('commander')

module.exports = createCommand('sync')
  .description('synchronize vendored dependencies')
  .addOption(
    createOption('--no-submodules', 'don\'t synchronize git submodules')
  )
  .action(action)

function action (_, cmd) {
  return require('../../..').vendor.sync(cmd.optsWithGlobals())
}
