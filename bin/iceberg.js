const fs = require('fs')
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
const icebergJsonExists = () => fs.existsSync('./iceberg.json')

const compile = () => { 
    if (icebergJsonExists()) {
        compiler(process.cwd())
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

function main(arguments) {
    if (arguments.length > 0 && arguments[0].startsWith('--')) {
        actions[arguments[0].slice(2)]()
    } else {
        console.log(usage)
    }
}

main(arguments)
