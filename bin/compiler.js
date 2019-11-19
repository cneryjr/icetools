#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const {parse} = require('../lib/parser')
const generate = require( '../lib/generator').default

const deleteBinDir = (projectDir) => fs.rmdirSync(`${projectDir}${path.sep}bin`, { recursive: true })
const deleteTmpDir = (projectDir) => fs.rmdirSync(`${projectDir}${path.sep}bin${path.sep}tmp`, { recursive: true })
const createBinDir = (projectDir) => fs.mkdirSync(`${projectDir}${path.sep}bin`, { recursive: true })
const createTmpDir = (projectDir) => fs.mkdirSync(`${projectDir}${path.sep}bin${path.sep}tmp`, { recursive: true })
const createManifestFile = (projectDir, entry) => fs.writeFileSync(`${projectDir}${path.sep}bin${path.sep}MANIFEST.MF`, `Manifest-Version: 1.0\nCreated-By: ice 0.1.2\nMain-Class: ${entry}\n\n`)
const deleteManifestFile = (projectDir) => fs.unlinkSync(`${projectDir}${path.sep}bin${path.sep}MANIFEST.MF`)
const capitalizeStr = (str) => str.charAt(0).toUpperCase() + str.slice(1)

const walkSync = function (ext, dir, filelist) {
    let files = fs.readdirSync(dir)

    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(dir + path.sep + file).isDirectory()) {
            filelist = walkSync(ext, dir + path.sep + file + path.sep, filelist)
        }
        else {
            if (path.extname(file) === ext) {
                filelist.push(path.resolve(dir, file))
            }
        }
    })

    return filelist
}

const transpile = (rootModule, sourceDir, inputFileName, targetDir) => {
    const fs1 = require('fs')
    const { promisify } = require('util')
    const closeFile = promisify(fs1.close)
    let simpleName = path.basename(inputFileName, '.ice')
    let className = capitalizeStr(simpleName)
    let dirs = path.dirname(path.relative(sourceDir, inputFileName)).split(path.sep)
    let pathOutputFile = `${targetDir}${[''].concat(dirs).join(path.sep)}`
    let outputFileName = `${pathOutputFile}${path.sep}${simpleName}.golo`

    // console.log(`NAME(${simpleName}), DIRS(${dirs})`)
    // console.log(`OUTPUT(${outputFileName})`)

    fs.mkdirSync(pathOutputFile, { recursive: true })
    fs.readFile(inputFileName, function (err, data) {
        if (err) throw err
        
        let src = data.toString()    
        let ast = parse(src, { 
            plugins: [
                "optionalChaining",
                "@babel/plugin-syntax-optional-chaining"
            ]
        });
        
        let output = generate(ast, { /* options */
            retainLines: false
        }, src)
            
        let sizeFile = 0
        // fs.unlinkSync(outputFileName);
        let moduleLine = `module ${rootModule}${[''].concat(dirs).join('.')}.${className}\n`
        let fd = fs.openSync(outputFileName, 'w')
        
        fs.writeSync(fd, moduleLine)
        sizeFile += moduleLine.length
        // output.code.split('\n').forEach(line => console.log(line))
        output.code.split('\n').forEach(line => {
            let codeLine = line.replace(/\;$/g, '') + '\n'
            fs.writeSync(fd, codeLine)
            sizeFile += codeLine.length
            // fs.fdatasyncSync(fd)
            // fs.fsyncSync(fd)
        })
        fs.fsyncSync(fd)
        fs.ftruncateSync(fd, sizeFile)
        // fs.close(fd, (err) => {
        //     console.log('\n###### CLOSED #########################\n')
        //     console.log('DIR FILES =>', fs.readdirSync('C:\\work\\nery\\ice.poc\\test\\bin\\main'))
        // })
        fs.closeSync(fd)
    })
}

function getGoloFiles(tmpDir, timeout) {
    let goloFiles = walkSync('.golo', tmpDir)

    const id = setInterval(function() {
        goloFiles = walkSync('.golo', tmpDir)

        if (goloFiles.length > 0) {
            clearInterval(id);
        }
    }, timeout)
}

exports.compiler = (projectDir) => {
    let binDir = `${projectDir}${path.sep}bin`
    let tmpDir = `${projectDir}${path.sep}bin${path.sep}tmp`
    let sourceDir = `${projectDir}${path.sep}src`
    let iceberg = JSON.parse(fs.readFileSync(`${projectDir}${path.sep}iceberg.json`, 'utf8'))
    let projectName = iceberg.name.replace(/\s/g, '_')
    let jarFileName = `${binDir}${path.sep}${projectName}.jar`
    let iceFiles = walkSync('.ice', sourceDir)
    let updateJarCmd = `jar -ufm ${jarFileName} ${binDir}${path.sep}MANIFEST.MF > nul 2>&1`  
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
        
    deleteBinDir(projectDir)
    createTmpDir(projectDir)

    iceFiles.map((iceFile) =>  transpile(projectName, sourceDir, iceFile, tmpDir))

    createManifestFile(projectDir, iceberg.entry)

    const id = setInterval(function() {
        let goloFiles = walkSync('.golo', tmpDir)

        if (goloFiles.length > 0) {            
            let compileCmd = goloFiles.reduce((prev, curr) => `${prev} ${curr}`, `golo compile --output ${jarFileName}`)
            
            // console.log('\n', compileCmd, '\n')        
            execSync(compileCmd)
            execSync(updateJarCmd)
            deleteManifestFile(projectDir) 
            deleteTmpDir(projectDir)
            clearInterval(id)
        }
    }, 200)        

}
