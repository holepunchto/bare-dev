const { createCommand, createOption } = require('commander')

module.exports = createCommand('test')
  .description('build and run tests')
  .addOption(
    createOption('-b, --build  <path>', 'the path to the build tree')
      .default('build')
  )
  .addOption(
    createOption('--timeout <seconds>', 'the default test timeout')
      .default(30)
      .argParser((value) => parseInt(value, 10))
  )
  .addOption(
    createOption('-d, --debug', 'configure a debug build')
      .default(false)
  )
  .action(action)

function action (_, cmd) {
  return require('../..').test(cmd.optsWithGlobals())
}
