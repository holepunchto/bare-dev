const { createCommand } = require('commander')

module.exports = createCommand('licenses')
  .description('accept or decline the Android SDK licenses')
  .addCommand(require('./licenses/accept'))
