const { createCommand, createOption } = require('commander')

module.exports = createCommand('prebuild')
  .description('perform a prebuild for the current platform and architecture')
  .addOption(
    createOption('-b, --build', 'the path to the build tree')
      .default('build')
  )
  .addOption(
    createOption('-p, --prebuilds', 'the path to the prebuilds directory')
      .default('prebuilds')
  )
  .addOption(
    createOption('-v, --verbose', 'spill the beans')
      .default(false)
  )
  .action(action)

function action (_, cmd) {
  return require('../..').prebuild(cmd.optsWithGlobals())
}
