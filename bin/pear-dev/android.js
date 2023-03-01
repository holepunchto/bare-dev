const path = require('path')
const os = require('os')

const { createCommand, createOption } = require('commander')

module.exports = createCommand('android')
  .description('manage Android')
  .addOption(
    createOption('--sdk <path>', 'the path to the sdk root')
      .default(path.join(os.homedir(), '.android/sdk'))
      .env('ANDROID_HOME')
  )
  .addCommand(require('./android/sdk'))
