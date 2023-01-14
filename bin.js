#!/usr/bin/env node

const minimist = require('minimist')
const path = require('path')

const args = minimist(process.argv, {
  boolean: ['include'],
  alias: {
    include: 'i'
  }
})

if (args.include) {
  console.log(path.join(__dirname, 'include'))
}
