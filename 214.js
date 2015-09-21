#!/usr/bin/env node

var program = require('commander'),	
	  scp     = require('./src/scpLoadFile.js').scp;

program
  .command('down')
  .description('download file from 214 to local')
  .option("-r, --remotepath [path]", "the file in 214")
  .option("-l, --localpath [path]",  "local file name")
  .action(function(options){
    var remotepath = options.remotepath || '';
    var localpath  = options.localpath || '';
    console.log('start to download file ', remotepath);
    scp.get(localpath, remotepath);
  })

program
  .command('upload')
  .description('upload file from local to 214')
  .option("-r, --remotepath [path]", "the file in 214")
  .option("-l, --localpath [path]",  "local file name")
  .action(function(options){
    var remotepath = options.remotepath || '';
    var localpath  = options.localpath || '';
    scp.send(localpath, remotepath);
  })

program.parse(process.argv);
