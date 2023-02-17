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
    createOption('-v, --verbose', 'spill the beans')
      .default(false)
  )
  .addCommand(require('./pear-dev/paths'))
  .addCommand(require('./pear-dev/require'))
  .addCommand(require('./pear-dev/vendor'))
  .addCommand(require('./pear-dev/init'))
  .addCommand(require('./pear-dev/configure'))
  .addCommand(require('./pear-dev/build'))
  .addCommand(require('./pear-dev/prebuild'))
  .addCommand(require('./pear-dev/clean'))
  .addCommand(require('./pear-dev/test'))
  .addCommand(require('./pear-dev/rebuild'))
  .addCommand(require('./pear-dev/bundle'))
  .parseAsync()
  .catch(err => {
    console.error(`error: ${err.message}`)
    process.exitCode = 1
  })
