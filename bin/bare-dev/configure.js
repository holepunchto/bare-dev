const { createCommand, createOption } = require('commander')

module.exports = createCommand('configure')
  .description('configure a build')
  .addOption(
    createOption('-s, --source <path>', 'the path to the source tree')
      .default(process.cwd(), 'process.cwd()')
  )
  .addOption(
    createOption('-b, --build <path>', 'the path to the build tree')
      .default('build')
  )
  .addOption(
    createOption('--toolchain <path>', 'the path to a toolchain file')
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
    createOption('--no-cache', 'disregard the build variable cache')
  )
  .addOption(
    createOption('-g, --generator <name>', 'the build generator to use')
      .choices(['make', 'ninja', 'xcode', 'visual-studio-2022'])
  )
  .addOption(
    createOption('--toolset <name>', 'the name of a compiler toolset supported by the generator')
  )
  .addOption(
    createOption('-d, --debug', 'configure a debug build')
      .default(false)
  )
  .addOption(
    createOption('--no-debug', 'don\'t configure a debug build')
  )
  .addOption(
    createOption('--sanitize <type>', 'enable sanitizer')
      .choices(['address', 'hwaddress', 'thread', 'undefined'])
      .implies({ debug: true })
  )
  .addOption(
    createOption('--asan', 'enable address sanitizer')
      .implies({ debug: true, sanitize: 'address' })
  )
  .addOption(
    createOption('--hwasan', 'enable hardware-assisted address sanitizer')
      .implies({ debug: true, sanitize: 'hwaddress' })
  )
  .addOption(
    createOption('--tsan', 'enable thread sanitizer')
      .implies({ debug: true, sanitize: 'thread' })
  )
  .addOption(
    createOption('--ubsan', 'enable undefined behavior sanitizer')
      .implies({ debug: true, sanitize: 'undefined' })
  )
  .addOption(
    createOption('-D, --define <var>[:<type>]=<value>', 'create or update a cache entry')
      .argParser((value, previous = []) => [...previous, value])
  )

  .addOption(
    createOption('--darwin-deployment-target <version>', 'the minimum macOS version to target')
      .default('11.0')
  )

  .addOption(
    createOption('--ios-deployment-target <version>', 'the minimum iOS version to target')
      .default('14.0')
  )

  .addOption(
    createOption('--android-ndk <version>', 'the Android NDK version to use')
  )
  .addOption(
    createOption('--android-api <version>', 'the Android API version to target')
  )

  .action(action)

function action (_, cmd) {
  return require('../..').configure(cmd.optsWithGlobals())
}
