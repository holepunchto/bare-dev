const { createCommand, createOption } = require('commander')

module.exports = createCommand('clean')
  .description('clean build artifacts')
  .addOption(
    createOption('-b, --build', 'the path to the build tree')
      .default('build')
  )
  .action(action)

function action (_, cmd) {
  return require('../..').clean(cmd.optsWithGlobals())
}
