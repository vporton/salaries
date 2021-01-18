const fs = require('fs')
const execSync = require('child_process').execSync;

fs.rmdir('dist', { recursive: true })
fs.mkdir('dist')

execSync('yarn build')

const jSrc = JSON.parse(fs.readFileSync('packages.json'))
const jBin = JSON.parse(fs.readFileSync('packages-version.json'))

jBin.version = jSrc.version

fs.writeFileSync('dist/packages-version.json', JSON.serialize(jBin))

execSync('cd dist && npm publish')
