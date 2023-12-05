import fs from 'fs'
import path from 'path'
import url from 'url'
import { globSync } from 'glob'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const root = path.join(__dirname, '..')

const include = path.join(root, 'include')

const bare = path.join(root, 'vendor/bare')

fs.rmSync(include, { recursive: true, force: true })
fs.mkdirSync(include)

const sources = [
  path.join(bare, 'include'),
  path.join(bare, 'vendor/libuv/include'),
  path.join(bare, 'vendor/libjs/include'),
  path.join(bare, 'vendor/libutf/include'),
  path.join(bare, 'vendor/libnapi/include')
]

for (const cwd of sources) {
  const files = globSync('**/*.h', {
    cwd,
    ignore: ['include/**', 'vendor/**', 'node_modules/**']
  })

  for (const file of files) {
    const directory = path.dirname(file)

    if (directory) fs.mkdirSync(path.join(include, directory), { recursive: true })

    fs.cpSync(path.join(cwd, file), path.join(include, file))
  }
}
