#!/usr/bin/env node

var mylib = require('../lib/index.js');

figlet.textSync('i.c.e - 2019', { horizontalLayout: 'full' })

// Displays the text in the console
mylib.say('Running globally!!');