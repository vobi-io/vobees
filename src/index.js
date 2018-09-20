#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var colors = require('colors');
const { prompt } = require('inquirer');

const GenerateModule = require('./generate');
const CreateModule = require('./create');

const Types = require('./types');

program
  .version('0.0.1')
  .description('Vobi Command Line Tool');


program
  .command('generate:module')
  .alias('a')
  .description('Generate New Module')
  .action(() => {
    prompt([{
      type : 'input',
      name : 'moduleName',
      message : 'Enter Module Name:'
    }])
      .then(answers => {
        if(!answers.moduleName) {
          return console.log(colors.red('You must enter module name'));
        }
        return new GenerateModule(answers.moduleName)
      });
  });

program
  .command('create:module')
  .alias('a')
  .description('Create Module')
  .action(() => {
    prompt([{
      type : 'list',
      name : 'moduleName',
      message : 'Choose Module:',
      choices: Types.modules
    }])
      .then(answers => {
        if(!answers.moduleName) {
          return console.log(colors.red('You must choose module'));
        }
        return new CreateModule(answers.moduleName)
      });
  });


program.parse(process.argv);