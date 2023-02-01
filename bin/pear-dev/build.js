const { createCommand, createOption } = require('commander')

module.exports = createCommand('build')
  .description('perform a build')
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
  const childProcess = require('child_process')

  const options = cmd.optsWithGlobals()

  const args = [
    '--build', options.build
  ]

  if (options.verbose) {
    args.push('--verbose')
  }

  const proc = childProcess.spawnSync('cmake', args, {
    stdio: 'inherit',
    cwd: options.cwd
  })

  if (proc.status) process.exitCode = proc.status
}
