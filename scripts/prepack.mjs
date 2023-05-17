import fs from 'fs'
import path from 'path'
import url from 'url'
import glob from 'glob'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const root = path.join(__dirname, '..')

const include = path.join(root, 'include')

const pear = path.join(root, 'vendor/pearjs')

fs.rmSync(include, { recursive: true, force: true })
fs.mkdirSync(include)

const sources = [
  path.join(root),
  path.join(pear, 'include'),
  path.join(pear, 'vendor/libuv/include'),
  path.join(pear, 'vendor/libjs/include'),
  path.join(pear, 'vendor/libnapi/include')
]

for (const cwd of sources) {
  const files = glob.globSync('**/*.h', {
    cwd,
    ignore: ['include/**', 'vendor/**', 'node_modules/**']
  })

  for (const file of files) {
    const directory = path.dirname(file)

    if (directory) fs.mkdirSync(path.join(include, directory), { recursive: true })

    fs.cpSync(path.join(cwd, file), path.join(include, file))
  }
}
