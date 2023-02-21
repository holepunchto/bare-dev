const { createCommand, createOption } = require('commander')

module.exports = createCommand('drive')
  .description('manage drives')
  .addOption(
    createOption('--corestore <path>', 'the path to the storage directory')
      .default('corestore')
  )
  .addCommand(require('./drive/list'))
  .addCommand(require('./drive/mirror'))
