const { createCommand, createOption } = require('commander')

module.exports = createCommand('build')
  .description('perform a build')
  .addOption(
    createOption('-b, --build', 'the path to the build tree')
      .default('build')
  )
  .addOption(
    createOption('-t, --target <name>', 'the target to build')
  )
  .addOption(
    createOption('-v, --verbose', 'spill the beans')
      .default(false)
  )
  .action(action)

function action (_, cmd) {
  return require('../..').build(cmd.optsWithGlobals())
}
