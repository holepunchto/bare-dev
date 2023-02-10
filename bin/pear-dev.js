#!/usr/bin/env node

const { program, createOption } = require('commander')

program
  .addOption(
    createOption('-c, --cwd <path>', 'the path to the working directory')
      .default(process.cwd(), 'process.cwd()')
  )
  .addOption(
    createOption('-q, --quiet', 'stay silent')
      .default(false)
  )
  .addOption(
    createOption('-i, --include', 'print the include path')
      .conflicts(['require', 'cmake-module-path'])
  )
  .addOption(
    createOption('-r, --require <module>', 'require and run a local module')
      .conflicts(['include', 'cmake-module-path'])
  )
  .addOption(
    createOption('--cmake-module-path', 'print the CMake module path')
      .conflicts(['include', 'require'])
  )
  .addCommand(require('./pear-dev/init'))
  .addCommand(require('./pear-dev/configure'))
  .addCommand(require('./pear-dev/build'))
  .addCommand(require('./pear-dev/prebuild'))
  .addCommand(require('./pear-dev/clean'))
  .addCommand(require('./pear-dev/rebuild'))
  .addCommand(require('./pear-dev/bundle'))
  .action(action)
  .parseAsync()
  .catch(err => {
    console.error(`error: ${err.stack}`)
    process.exitCode = 1
  })

function action (options) {
  const dev = require('..')

  if (options.include) {
    process.stdout.write(dev.include)
  }

  if (options.require) {
    dev.require(options.require, options.cwd)
  }

  if (options.cmakeModulePath) {
    process.stdout.write(dev.cmake.modulePath)
  }
}
