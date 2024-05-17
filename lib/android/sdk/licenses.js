const exec = require('../../shared/exec')
const sdk = require('../shared/sdk')

const yes = Buffer.from('y\r\n'.repeat(7 /* Review + 6 licenses */))

exports.accept = function accept (opts = {}) {
  exec(sdk.manager(), ['--licenses'], { ...opts, input: yes })
}
