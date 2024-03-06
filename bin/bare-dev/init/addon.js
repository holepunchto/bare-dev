const { createCommand, createOption } = require('commander')

module.exports = createCommand('addon')
  .description('initialize an addon build definition')
  .addOption(
    createOption('-f, --force', 'overwrite any existing build definition')
      .default(false)
  )
  .action(action)

function action (_, cmd) {
  return require('../../..').init.addon(cmd.optsWithGlobals())
}
