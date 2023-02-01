const { createCommand, createOption } = require('commander')

module.exports = createCommand('init')
  .description('initialize a build definition')
  .addOption(
    createOption('-f, --force', 'overwrite any existing build definition')
      .default(false)
  )
  .action(action)

function action (_, cmd) {
  require('../..').init(cmd.optsWithGlobals())
}
