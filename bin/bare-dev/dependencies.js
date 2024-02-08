const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('dependencies')
  .description('compute the dependencies of module tree')
  .addArgument(
    createArgument('entry', 'the entry point to the module tree')
  )
  .addOption(
    createOption('--config <path>', 'read configuration from a file')
      .implies({ print: false })
  )
  .addOption(
    createOption('--print', 'write the bundle to stdout')
      .default(true)
  )
  .addOption(
    createOption('--separator <string>', 'the separator to print between entries')
      .default('\n')
  )
  .addOption(
    createOption('-o, --out <path>', 'write the dependencies to a file')
      .implies({ print: false })
  )
  .action(action)

function action (entry, _, cmd) {
  return require('../..').dependencies(entry, cmd.optsWithGlobals())
}
