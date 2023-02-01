const { createCommand, createOption } = require('commander')

module.exports = createCommand('build')
  .description('perform a build')
  .addOption(
    createOption('-b, --build', 'the path to the build tree')
      .default('build')
  )
  .action(action)

function action(_, cmd) {
  const childProcess = require('child_process')

  const options = cmd.optsWithGlobals()

  const proc = childProcess.spawnSync('cmake', [
    '--build', options.build,
  ], {
    stdio: 'inherit',
    cwd: options.cwd
  })

  if (proc.status) process.exitCode = proc.status
}
