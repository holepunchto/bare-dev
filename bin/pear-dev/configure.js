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
    createOption('-d, --debug', 'configure a debug build')
      .default(false)
  )
  .action(action)

function action (_, cmd) {
  require('../..').configure(cmd.optsWithGlobals())
}
