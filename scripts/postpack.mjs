import fs from 'fs'
import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const root = path.join(__dirname, '..')

const include = path.join(root, 'include')

fs.rmSync(include, { recursive: true, force: true })
