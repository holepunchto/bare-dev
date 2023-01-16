#!/usr/bin/env node

const minimist = require('minimist')
const path = require('path')
const dev = require('./')

const args = minimist(process.argv, {
  boolean: ['include'],
  alias: {
    include: 'i'
  }
})

if (args.include) {
  process.stdout.write(dev.include)
}
