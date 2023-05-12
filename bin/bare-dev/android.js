const { createCommand, createOption } = require('commander')

module.exports = createCommand('android')
  .description('manage Android')
  .addOption(
    createOption('--sdk <path>', 'the path to the sdk root')
      .default(require('../../lib/android/shared/sdk').path)
      .env('ANDROID_HOME')
  )
  .addCommand(require('./android/sdk'))
  .addCommand(require('./android/device'))
  .addCommand(require('./android/run'))
