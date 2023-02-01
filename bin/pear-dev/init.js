const { createCommand } = require('commander')

module.exports = createCommand('init')
  .description('initialize a build definition')
  .action(action)

function action (_, cmd) {
  require('../..').init(cmd.optsWithGlobals())
}
