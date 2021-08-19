#!/bin/node
const inputs = ['config.js', 'library.js']
const output = 'allekok.js'
const fs = require('fs')

let content = ''

for(const input of inputs)
	content += fs.readFileSync(input).toString() + '\n'

fs.writeFileSync(output, content.trim())
console.log(`'${output}' made successfully.`)
