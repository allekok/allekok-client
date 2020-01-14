#!/bin/node
const inputs = ['config.js', 'library.js'];
const output = 'allekok.js';
const fs = require('fs');

let content = '';

for(const i in inputs)
    content += fs.readFileSync(inputs[i]).toString();

fs.writeFileSync(output, content);
console.log(`'${output}' made successfully.`);
