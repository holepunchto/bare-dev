const { createCommand, createOption } = require('commander')

module.exports = createCommand('build')
  .description('perform a build')
  .addOption(
    createOption('-b, --build <path>', 'the path to the build tree')
      .default('build')
  )
  .addOption(
    createOption('-t, --target <name>', 'the target to build')
  )
  .addOption(
    createOption('-j, --parallel <number>', 'parallelism')
      .argParser(n => Number(n))
  )
  .addOption(
    createOption('-d, --debug', 'configure a debug build')
      .default(false)
  )
  .addOption(
    createOption('--cmake', 'build using CMake')
      .implies({ gradle: false })
  )
  .addOption(
    createOption('--gradle', 'build using Gradle')
      .implies({ cmake: false })
  )
  .action(action)

function action (_, cmd) {
  return require('../..').build(cmd.optsWithGlobals())
}
