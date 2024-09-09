const fs = require('fs')
const os = require('os')
const path = require('path')
const { globSync } = require('glob')

module.exports = function install (opts = {}) {
  const {
    build = 'build',
    prebuilds = 'prebuilds',
    platform = os.platform(),
    arch = os.arch(),
    simulator = false,
    bare = true,
    node = false,
    link = false,
    force = false,
    sync = false,
    cwd = path.resolve('.')
  } = opts

  const info = require(path.join(cwd, 'package.json'))

  const name = info.name.replace(/\//g, '+')

  const extensions = []

  if (bare) extensions.push('.bare')
  if (node) extensions.push('.node')

  const dir = path.resolve(cwd, prebuilds, `${platform}-${arch}${simulator ? '-simulator' : ''}`)

  const targets = extensions.map(ext => path.join(dir, name + ext))

  if (force || !targets.every(target => isFile(target))) {
    if (sync) require('./vendor/sync')(opts)

    if (isFile(path.join(cwd, 'CMakeLists.txt'))) {
      require('./configure')(opts)
      require('./build')(opts)

      fs.mkdirSync(dir, { recursive: true })

      for (const target of targets) {
        const [addon] = globSync(path.join(cwd, build, `**/${name}${path.extname(target)}`), {
          windowsPathsNoEscape: true
        })

        if (addon) {
          try {
            fs.unlinkSync(target)
          } catch {}

          if (link) {
            fs.symlinkSync(addon, target)
          } else {
            fs.copyFileSync(addon, target)
          }
        }
      }
    }
  }
}

function isFile (file) {
  try {
    return fs.statSync(file).isFile()
  } catch {
    return false
  }
}
