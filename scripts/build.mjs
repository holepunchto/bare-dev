import fs from 'fs'
import path from 'path'
import url from 'url'
import { spawnSync } from 'child_process'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const tmp = path.join(__dirname, '../tmp/pearjs')
const incl = path.join(__dirname, '../include')

try {
  fs.rmSync(tmp, { recursive: true })
} catch {}

const { status } = spawnSync('git', ['clone', '--recurse-submodules', 'git@github.com:holepunchto/pearjs-next.git', tmp], {
  stdio: 'inherit'
})

if (status) process.exit(status)

try {
  fs.rmSync(incl, { recursive: true })
} catch {}

fs.mkdirSync(incl)

moveToInclude(path.join(tmp, 'vendor/libuv/include'))
moveToInclude(path.join(tmp, 'vendor/libjs/include'))
moveToInclude(path.join(tmp, 'vendor/libnapi/include'))
moveToInclude(path.join(tmp, 'include'))

function moveToInclude (from) {
  for (const name of fs.readdirSync(from)) {
    fs.renameSync(path.join(from, name), path.join(incl, name))
  }
}
