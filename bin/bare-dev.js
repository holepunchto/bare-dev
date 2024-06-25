#!/usr/bin/env node

const process = require('process')
const path = require('path')
const { program, createOption } = require('commander')

const pkg = require('../package.json')

program
  .version(pkg.version)
  .addOption(
    createOption('-c, --cwd <path>', 'the path to the working directory')
      .default(path.resolve('.'))
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
  .addOption(
    createOption('-j, --parallel <number>', 'parallelism')
      .default(1)
      .argParser(n => Number(n))
  )
  .addCommand(require('./bare-dev/paths'))
  .addCommand(require('./bare-dev/vendor'))
  .addCommand(require('./bare-dev/drive'))
  .addCommand(require('./bare-dev/init'))
  .addCommand(require('./bare-dev/configure'))
  .addCommand(require('./bare-dev/build'))
  .addCommand(require('./bare-dev/install'))
  .addCommand(require('./bare-dev/clean'))
  .addCommand(require('./bare-dev/test'))
  .addCommand(require('./bare-dev/bundle'))
  .addCommand(require('./bare-dev/dependencies'))
  .addCommand(require('./bare-dev/ios'))
  .addCommand(require('./bare-dev/android'))
  .parseAsync()
  .catch(err => {
    console.error(`error: ${err.message}`)
    process.exitCode = 1
  })
