#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const mylib = require('../lib/index.js')

exports.runner = (prjDir) => {
    let sep = (process.platform == 'win32' || process.platform == 'win64') ? ';' : ':'
    let projectDir = prjDir.replace(/[\\\/]$/g, '')
    let binDir = `${projectDir}${path.sep}bin`
    let jarsDir = path.resolve(__dirname, `..${path.sep}jars${path.sep}*`)
    let iceberg = JSON.parse(fs.readFileSync(`${projectDir}${path.sep}iceberg.json`, 'utf8'))
    let projectName = iceberg.name.replace(/\s/g, '_')
    let packages = `${projectName}.${iceberg.entry.replace(/[\\\/]/g, '.').replace(/\.ice$/, '')}`.split('.') 
    let mainFile = packages.slice(-1).pop().charAt(0).toUpperCase() + packages.slice(-1).pop().slice(1)
    let entry = packages.slice(0, -1).concat([mainFile]).join('.') 
    let jarFileName = `${binDir}${path.sep}${projectName}.jar`
    let cp = (iceberg.jars || []).reduce((curr, jar, idx) => `${curr}${sep}${jar}`, `-cp ${jarFileName}`)
    let javaCmd = `java ${cp}${sep}${jarsDir} ${entry}`

    // console.log(javaCmd)
    let output = execSync(javaCmd)
    process.stdout.write(output.toString())
}
