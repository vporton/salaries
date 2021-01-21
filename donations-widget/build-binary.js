const fs = require('fs')
const execSync = require('child_process').execSync;

fs.rmdirSync('dist-bin', { recursive: true }, () => {})
fs.mkdirSync('dist-bin', () => {})

execSync('npx vue-cli-service build --target wc --dest dist-bin/Donate --name donations-donate src/views/Donate.vue')
execSync('npx vue-cli-service build --target wc --dest dist-bin/Register --name donations-register src/views/Register.vue')
execSync('cp ../abi/*.json dist-bin/')

const jSrc = JSON.parse(fs.readFileSync('package.json'))
const jBin = JSON.parse(fs.readFileSync('package-binary.json'))

jBin.version = jSrc.version

fs.writeFileSync('dist-bin/package.json', JSON.stringify(jBin))
