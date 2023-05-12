const { createCommand, createOption } = require('commander')

module.exports = createCommand('configure')
  .description('configure a build')
  .addOption(
    createOption('-s, --source', 'the path to the source tree')
      .default(process.cwd(), 'process.cwd()')
  )
  .addOption(
    createOption('-b, --build <path>', 'the path to the build tree')
      .default('build')
  )
  .addOption(
    createOption('-p, --platform <name>', 'the operating system platform to build for')
      .choices(['darwin', 'ios', 'linux', 'android', 'win32'])
      .default(process.platform, 'process.platform')
  )
  .addOption(
    createOption('-a, --arch <name>', 'the operating system architecture to build for')
      .choices(['arm', 'arm64', 'ia32', 'x64'])
      .default(process.arch, 'process.arch')
  )
  .addOption(
    createOption('--simulator', 'build for a simulator')
  )
  .addOption(
    createOption('-g, --generator <name>', 'the build generator to use')
      .choices(['make', 'ninja', 'xcode', 'visual-studio-2022'])
  )
  .addOption(
    createOption('-d, --debug', 'configure a debug build')
      .default(false)
  )
  .addOption(
    createOption('--sanitize <type>', 'enable sanitizer')
      .choices(['address', 'thread'])
      .implies({ debug: true })
  )
  .addOption(
    createOption('-D, --define <var>[:<type>]=<value>', 'create or update a cache entry')
      .argParser((value, previous = []) => [...previous, value])
  )
  .action(action)

function action (_, cmd) {
  return require('../..').configure(cmd.optsWithGlobals())
}
