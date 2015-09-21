#!/usr/bin/env node

var program = require('commander'),	
	cdn     = require('./src/cdnUploadFile.js');

program
  .command('upload')
  .description('upload file to cdn')
  .option("-f, --filepath [path]", "the file need to be uploaded")
  .option("-m, --md5", "the file name will be md5 string")
  .action(function(options){
    var filepath = options.filepath || '';
    var md5      = options.md5  || false;
    console.log(('start to upload file: ' + filepath).green);
    cdn.upload(filepath, md5);
  });
  
program.parse(process.argv);
