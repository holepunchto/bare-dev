const { createCommand, createArgument } = require('commander')

module.exports = createCommand('require')
  .description('require and run a local module')
  .addArgument(
    createArgument('name', 'the name of the module to require')
  )
  .action(action)

function action (name, _, cmd) {
  return require('../..').require(name, cmd.optsWithGlobals())
}
