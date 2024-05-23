const { createCommand } = require('commander')

module.exports = createCommand('accept')
  .description('accept the Android SDK licenses')
  .action(action)

function action (_, cmd) {
  return require('../../../../..').android.sdk.licenses.accept(cmd.optsWithGlobals())
}
