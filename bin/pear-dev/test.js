const { createCommand, createOption } = require('commander')

module.exports = createCommand('test')
  .description('build and run tests')
  .addOption(
    createOption('-b, --build', 'the path to the build tree')
      .default('build')
  )
  .action(action)

function action (_, cmd) {
  return require('../..').test(cmd.optsWithGlobals())
}
