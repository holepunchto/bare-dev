const os = require('os')
const { createCommand, createArgument, createOption } = require('commander')

module.exports = createCommand('bundle')
  .description('bundle a module tree')
  .addArgument(
    createArgument('entry', 'the entry point to the module tree')
  )
  .addOption(
    createOption('--config <path>', 'read configuration from a file')
      .implies({ print: false })
  )
  .addOption(
    createOption('-p, --platform <name>', 'the operating system platform to bundle for')
      .choices(['darwin', 'ios', 'linux', 'android', 'win32'])
      .default(os.platform())
  )
  .addOption(
    createOption('-a, --arch <name>', 'the operating system architecture to bundle for')
      .choices(['arm', 'arm64', 'ia32', 'x64'])
      .default(os.arch())
  )
  .addOption(
    createOption('--simulator', 'bundle for a simulator')
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
    createOption('--header <string>', 'add a header to the bundle')
  )
  .addOption(
    createOption('--footer <string>', 'add a footer to the bundle')
  )
  .addOption(
    createOption('--packages', 'include package manifests')
      .default(true)
  )
  .addOption(
    createOption('--no-packages', 'don\'t include package manifests')
  )
  .addOption(
    createOption('--prebuilds', 'include addon prebuilds')
      .default(false)
  )
  .addOption(
    createOption('--no-prebuilds', 'don\'t include addon prebuilds')
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
      .argParser((value) => /\d+/.test(value) ? parseInt(value, 10) : value)
  )
  .action(action)

function action (entry, _, cmd) {
  return require('../..').bundle(entry, cmd.optsWithGlobals())
}
