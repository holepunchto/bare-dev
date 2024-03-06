const { createCommand } = require('commander')

module.exports = createCommand('init')
  .description('initialize templates')
  .addCommand(require('./init/addon'))
  .addCommand(require('./init/appling'))
