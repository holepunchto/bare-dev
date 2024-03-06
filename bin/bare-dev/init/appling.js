const { createCommand, createOption } = require('commander')

module.exports = createCommand('appling')
  .description('initialize an appling build definition')
  .addOption(
    createOption('-f, --force', 'overwrite any existing build definition')
      .default(false)
  )
  .action(action)

function action (_, cmd) {
  return require('../../..').init.appling(cmd.optsWithGlobals())
}
