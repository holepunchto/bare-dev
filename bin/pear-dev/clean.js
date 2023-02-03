const { createCommand, createOption } = require('commander')

module.exports = createCommand('clean')
  .description('clean build artifacts')
  .addOption(
    createOption('-b, --build', 'the path to the build tree')
      .default('build')
  )
  .addOption(
    createOption('-v, --verbose', 'spill the beans')
      .default(false)
  )
  .action(action)

function action (_, cmd) {
  require('../..').clean(cmd.optsWithGlobals())
}