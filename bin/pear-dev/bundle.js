const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('bundle')
  .description('bundle a module tree')
  .addArgument(
    createArgument('entry', 'the entry point to the module tree')
  )
  .addOption(
    createOption('-p, --protocol <name>', 'the protocol to prepend to source URLs')
      .default('app')
  )
  .addOption(
    createOption('-f, --format <name>', 'the format of the bundle')
      .default('bundle')
      .choices(['bundle', 'js'])
  )
  .addOption(
    createOption('-t, --target <name>', 'the target that will consume the bundle')
      .default('js')
      .choices(['js', 'c'])
  )
  .addOption(
    createOption('-n, --name <name>', 'the name of the bundle')
      .default('bundle')
  )
  .addOption(
    createOption('--print', 'write the bundle to stdout')
      .default(true)
  )
  .addOption(
    createOption('-o, --out <path>', 'write the bundle to a file')
      .implies({ print: false })
  )
  .addOption(
    createOption('--indent <n>', 'number of spaces to use for indents')
      .default(2)
      .argParser((value) => /\d+/.test(value) ? parseInt(value) : value)
  )
  .action(action)

function action (entry, _, cmd) {
  return require('../..').bundle(entry, cmd.optsWithGlobals())
}
