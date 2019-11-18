#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const process = require('process')
const { execSync } = require('child_process')
const { compiler } = require('./compiler')

let arguments = process.argv.slice(2)
let isWindows = (process.platform == 'win32' || process.platform == 'win64') ? true : false
const usage = `Usage: iceberg <action> 
where <action> is one of:
    --compile    Compile current project
    --init       Set up the the ice project in current directory
    --run        Execute current project
`
const icebergJsonExists = (projectDir) => fs.existsSync(path.resolve(projectDir, './iceberg.json'))

const compile = (dir) => { 
    let projectDir = dir || process.cwd()
    
    if (icebergJsonExists(projectDir)) {
        compiler(projectDir)
    } else {
        console.log(usage)
    }
}

const init = () => { 

}

const run = () => { 
    if (icebergJsonExists()) {
        
    } else {
        console.log(usage)
    }
}

let actions = { compile, init, run }

function main(args) {
    if (args.length > 1 && args[2].startsWith('--')) {
        actions[args[2].slice(2)](args[3])
    } else {
        console.log(usage)
    }
}

main(process.argv)
