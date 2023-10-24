#!/usr/bin/env node

const { program, createOption } = require('commander')

const pkg = require('../package.json')

program
  .version(pkg.version)
  .addOption(
    createOption('-c, --cwd <path>', 'the path to the working directory')
      .default(process.cwd(), 'process.cwd()')
  )
  .addOption(
    createOption('-q, --quiet', 'stay silent')
      .conflicts(['verbose'])
      .default(false)
  )
  .addOption(
    createOption('--verbose', 'spill the beans')
      .conflicts(['quiet'])
      .default(false)
  )
  .addCommand(require('./bare-dev/paths'))
  .addCommand(require('./bare-dev/require'))
  .addCommand(require('./bare-dev/vendor'))
  .addCommand(require('./bare-dev/drive'))
  .addCommand(require('./bare-dev/init'))
  .addCommand(require('./bare-dev/configure'))
  .addCommand(require('./bare-dev/build'))
  .addCommand(require('./bare-dev/prebuild'))
  .addCommand(require('./bare-dev/install'))
  .addCommand(require('./bare-dev/clean'))
  .addCommand(require('./bare-dev/test'))
  .addCommand(require('./bare-dev/rebuild'))
  .addCommand(require('./bare-dev/bundle'))
  .addCommand(require('./bare-dev/dependencies'))
  .addCommand(require('./bare-dev/ios'))
  .addCommand(require('./bare-dev/android'))
  .parseAsync()
  .catch(err => {
    console.error(`error: ${err.message}`)
    process.exitCode = 1
  })
