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
    createOption('--debug', 'configure a debug build')
      .default(false)
  )
  .action(action)

function action(_, cmd) {
  const childProcess = require('child_process')
  const dev = require('../..')

  const options = cmd.optsWithGlobals()

  const proc = childProcess.spawnSync('cmake', [
    '-S', options.source,
    '-B', options.build,
    `-DCMAKE_BUILD_TYPE=${options.debug ? 'Debug' : 'Release'}`
    `-DCMAKE_MODULE_PATH=${dev.cmake.modulePath}`
  ], {
    stdio: 'inherit',
    cwd: options.cwd
  })

  if (proc.status) process.exitCode = proc.status
}
