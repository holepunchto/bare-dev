const path = require('path')
const os = require('os')

exports.path = process.env.ANDROID_HOME || path.join(os.homedir(), '.android/sdk')
