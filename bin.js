#!/usr/bin/env node

const minimist = require('minimist')
const dev = require('.')

const args = minimist(process.argv, {
  boolean: ['include', 'cmake-module-path'],
  alias: {
    include: 'i',
    require: 'r',
    cwd: 'c'
  }
})

if (args.include) {
  process.stdout.write(dev.include)
}

if (args.require) {
  dev.require(args.require, args.cwd)
}

if (args['cmake-module-path']) {
  process.stdout.write(dev.cmake.modulePath)
}
