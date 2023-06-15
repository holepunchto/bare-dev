const { createCommand, createOption } = require('commander')

module.exports = createCommand('install')
  .description('perform a clean build unless prebuilds are available')
  .addOption(
    createOption('-s, --source <path>', 'the path to the source tree')
      .default(process.cwd(), 'process.cwd()')
  )
  .addOption(
    createOption('-b, --build <path>', 'the path to the build tree')
      .default('build')
  )
  .addOption(
    createOption('-p, --prebuilds <path>', 'the path to the prebuilds directory')
      .default('prebuilds')
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
    createOption('--asan', 'enable address sanitizer')
      .implies({ debug: true, sanitize: 'address' })
  )
  .addOption(
    createOption('--tsan', 'enable thread sanitizer')
      .implies({ debug: true, sanitize: 'thread' })
  )
  .addOption(
    createOption('-D, --define <var>[:<type>]=<value>', 'create or update a cache entry')
      .argParser((value, previous = []) => [...previous, value])
  )
  .addOption(
    createOption('--force', 'perform a clean build even if prebuilds are available')
  )
  .addOption(
    createOption('--sync', 'synchronize vendored dependencies')
  )
  .addOption(
    createOption('--no-submodules', 'don\'t synchronize git submodules')
  )
  .addOption(
    createOption('--no-recursive', 'don\'t recurse into node_modules')
  )
  .action(action)

function action (_, cmd) {
  return require('../..').install(cmd.optsWithGlobals())
}
