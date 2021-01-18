const fs = require('fs')
const execSync = require('child_process').execSync;

fs.rmdir('dist-bin', { recursive: true }, () => {})
fs.mkdir('dist-bin', () => {})

execSync('npx vue-cli-service build --target lib --dest dist-bin/Donate --name Donations src/views/Donate.vue')
execSync('npx vue-cli-service build --target lib --dest dist-bin/Register --name Donations src/views/Register.vue')

const jSrc = JSON.parse(fs.readFileSync('package.json'))
const jBin = JSON.parse(fs.readFileSync('package-binary.json'))

jBin.version = jSrc.version

fs.writeFileSync('dist-bin/package.json', JSON.stringify(jBin))
