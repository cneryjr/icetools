const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const createBinDir = (projectDir) => fs.mkdirSync(`${projectDir}/bin`, { recursive: true })
const createManifestFile = (projectDir, entry) => fs.writeFileSync(`${projectDir}/bin/MANIFEST.MF`, `Manifest-Version: 1.0\nCreated-By: ice 0.1.2\nMain-Class: ${entry}\n\n`)
const deleteManifestFile = (projectDir) => fs.unlinkSync(`${projectDir}/bin/MANIFEST.MF`)
const walkSync = function (dir, filelist) {
    let files = fs.readdirSync(dir)

    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(dir + '/' + file).isDirectory()) {
            filelist = walkSync(dir + '/' + file + '/', filelist)
        }
        else {
            if (path.extname(file) === '.golo') {
                filelist.push(path.resolve(dir, file))
            }
        }
    })

    return filelist
}

let args = process.argv.slice(2)
let projectDir = args[0].replace(/[\/\\]$/, '')
let sourceDir = `${projectDir}/src`
let iceberg = JSON.parse(fs.readFileSync(`${projectDir}/iceberg.json`, 'utf8'))
let jarFileName = `${projectDir}/bin/${iceberg.name.replace(/\s/g, '_')}.jar`
let files = walkSync(sourceDir)
let compileCmd = files.reduce((prev, curr) => `${prev} ${curr}`, `golo compile --output ${jarFileName}`)
let updateJarCmd = `jar -ufm ${jarFileName} ${projectDir}/bin/MANIFEST.MF`

createBinDir(projectDir)
createManifestFile(projectDir, iceberg.entry)
execSync(compileCmd)
execSync(updateJarCmd)
deleteManifestFile(projectDir)
// new Promise(resolve => setTimeout(resolve, 5000)).then((args) => deleteManifestFile(projectDir))
