const { createCommand, createOption } = require('commander')

module.exports = createCommand('rebuild')
  .description('clean, configure, and build')
  .addOption(
    createOption('-s, --source', 'the path to the source tree')
      .default(process.cwd(), 'process.cwd()')
  )
  .addOption(
    createOption('-b, --build', 'the path to the build tree')
      .default('build')
  )
  .addOption(
    createOption('-t, --target <name>', 'the target to build')
  )
  .addOption(
    createOption('-g, --generator <name>', 'the build generator to use')
  )
  .addOption(
    createOption('-d, --debug', 'configure a debug build')
      .default(false)
  )
  .addOption(
    createOption('-s, --sanitize <type>', 'enable sanitizer')
      .choices(['address'])
  )
  .addOption(
    createOption('-v, --verbose', 'spill the beans')
      .default(false)
  )
  .action(action)

function action (_, cmd) {
  require('../..').rebuild(cmd.optsWithGlobals())
}
