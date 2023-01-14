#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import url from 'url'
import { tmpdir } from 'os'
import { spawnSync } from 'child_process'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const tmp = path.join(__dirname, '../tmp/pearjs')
const incl = path.join(__dirname, '../include')

try {
  fs.rmSync(tmp, { recursive: true })
} catch {}

const { status } = spawnSync('git', ['clone', '--recurse-submodules', 'git@github.com:holepunchto/pearjs-experiment.git', tmp], {
  stdio: 'inherit'
})

if (status) process.exit(status)

try {
  fs.rmSync(incl, { recursive: true })
} catch {}

fs.mkdirSync(incl)

moveToInclude(path.join(tmp, 'deps/libjs/vendor/libuv/include'))
moveToInclude(path.join(tmp, 'deps/libjs/include'))
moveToInclude(path.join(tmp, 'deps/libnapi/include'))
moveToInclude(path.join(tmp, 'include'))

function moveToInclude (from) {
  for (const name of fs.readdirSync(from)) {
    fs.renameSync(path.join(from, name), path.join(incl, name))
  }
}
// console.log({
//   UV,
//   JS,
//   PEAR
// })
