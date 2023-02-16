const { createCommand, createOption } = require('commander')

module.exports = createCommand('configure')
  .description('configure a build')
  .addOption(
    createOption('-s, --source', 'the path to the source tree')
      .default(process.cwd(), 'process.cwd()')
  )
  .addOption(
    createOption('-b, --build', 'the path to the build tree')
      .default('build')
  )
  .addOption(
    createOption('-p, --platform <name>', 'the operating system platform to build for')
      .choices(['darwin', 'ios', 'linux', 'android', 'win32'])
      .default(process.platform, 'process.platform')
  )
  .addOption(
    createOption('--simulator', 'build for a simulator')
  )
  .addOption(
    createOption('-g, --generator <name>', 'the build generator to use')
      .choices(['make', 'ninja', 'xcode'])
  )
  .addOption(
    createOption('-d, --debug', 'configure a debug build')
      .default(false)
  )
  .addOption(
    createOption('--sanitize <type>', 'enable sanitizer')
      .choices(['address'])
  )
  .action(action)

function action (_, cmd) {
  return require('../..').configure(cmd.optsWithGlobals())
}
