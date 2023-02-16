
const { createCommand, createArgument } = require('commander')

module.exports = createCommand('paths')
  .description('print paths')
  .addArgument(
    createArgument('path', 'the path to print')
      .choices(['include', 'cmake'])
  )
  .action(action)

function action (path) {
  process.stdout.write(require('../..').paths[path])
}
