const { createCommand, createArgument } = require('commander')

module.exports = createCommand('list')
  .description('list available devices')
  .alias('ls')
  .addArgument(
    createArgument('term', 'the search term to match devices against')
      .argOptional()
      .default('available')
  )
  .action(action)

function action (term, _, cmd) {
  return require('../../../..').ios.device.list(term, cmd.optsWithGlobals())
}
