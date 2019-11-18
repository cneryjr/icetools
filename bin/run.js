#!/usr/bin/env node
const fs = require('fs')
const { execSync } = require('child_process')
const mylib = require('../lib/index.js')

let sep = (process.platform == 'win32' || process.platform == 'win64') ? ';' : ':'
let args = process.argv.slice(2)
let projectDir = args[0].replace(/[\/\\]$/, '')
let iceberg = JSON.parse(fs.readFileSync(`${projectDir}/iceberg.json`, 'utf8'))
let jarFileName = `${projectDir}/bin/${iceberg.name.replace(/\s/g, '_')}.jar`
let cp = (iceberg.jars || []).reduce((curr, jar, idx) => `${curr}${sep}${jar}`, `-cp ${jarFileName}`)
let javaCmd = `java ${cp} ${iceberg.entry}`

console.log(javaCmd)
// let output = execSync(javaCmd)
// process.stdout.write(output.toString())
