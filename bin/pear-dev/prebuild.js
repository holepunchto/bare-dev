const { createCommand, createOption } = require('commander')

module.exports = createCommand('prebuild')
  .description('perform a prebuild for the current platform and architecture')
  .addOption(
    createOption('-b, --build <path>', 'the path to the build tree')
      .default('build')
  )
  .addOption(
    createOption('-p, --prebuilds <path>', 'the path to the prebuilds directory')
      .default('prebuilds')
  )
  .action(action)

function action (_, cmd) {
  return require('../..').prebuild(cmd.optsWithGlobals())
}
