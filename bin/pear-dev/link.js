const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('link')
  .description('link together a module tree')
  .addArgument(
    createArgument('entry', 'the entry point to the module tree')
  )
  .addOption(
    createOption('--print', 'write the manifest to stdout')
      .default(true)
  )
  .addOption(
    createOption('-o, --out <path>', 'write the manifest to a file')
      .implies({ print: false })
  )
  .addOption(
    createOption('--indent <n>', 'number of spaces to use for indents')
      .default(2)
      .argParser((value) => /\d+/.test(value) ? parseInt(value) : value)
  )
  .action(action)

function action (entry, _, cmd) {
  return require('../..').link(entry, cmd.optsWithGlobals())
}
