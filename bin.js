#!/usr/bin/env node

const minimist = require('minimist')
const path = require('path')
const dev = require('./')

const args = minimist(process.argv, {
  boolean: ['include'],
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
