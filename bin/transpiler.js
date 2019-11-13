#!/usr/bin/env node

/**
 * Arquivos modificados:
 *  C:\work\nery\ice\node_modules\@ice\parser\lib\index.js
 *  C:\work\nery\ice\node_modules\@ice\generator\lib\generators\types.js
 *  C:\work\nery\ice\node_modules\@ice\generator\lib\generators\expressions.js
 */

// const os = require('os')
const fs = require('fs')
const path = require('path')
const {parse} = require('../lib/parser')
const generate = require( '../lib/generator').default


let fileName = process.argv[2]

const transpile = (rootModule, inputFileName, outputFileName) => {
    let dirs = path.dirname(filename).split(path.sep)
    
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

        // let writeStream = fs.createWriteStream(outputFileName)

        // writeStream.write('module poc\n')
        // output.code.split('\n').forEach(line => writeStream.write(line.replace(/\;$/g, '') + '\n'))
        // writeStream.end();

    })
}

// exports = transpile

let dirs = path.dirname(fileName).split(path.sep)

console.log('__dirname:', __dirname)
console.log(dirs)
