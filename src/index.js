#!/usr/bin/env node

/**
 * Module dependencies.
 */


import program from 'commander';
import colors from 'colors';
import { prompt } from 'inquirer';
import Types from './types';
import GenerateModule from './generate';
import CreateModule from './create';
import Seeder from './seeder';


program
  .version('0.0.1')
  .description('Vobi Command Line Tool');


program
  .command('generate:module')
  .alias('a')
  .description('Generate New Module')
  .action(() => {
    prompt([{
      type: 'input',
      name: 'moduleName',
      message: 'Enter Module Name:',
    }])
      .then((answers) => {
        if (!answers.moduleName) {
          return console.log(colors.red('You must enter module name'));
        }
        return new GenerateModule(answers.moduleName);
      });
  });

program
  .command('create:module')
  .alias('a')
  .description('Create Module')
  .action(() => {
    prompt([{
      type: 'list',
      name: 'moduleName',
      message: 'Choose Module:',
      choices: Types.modules,
    }])
      .then((answers) => {
        if (!answers.moduleName) {
          return console.log(colors.red('You must choose module'));
        }
        return new CreateModule(answers.moduleName);
      });
  });

program
  .command('seed')
  .alias('s')
  .description('Seed')
  .option('-o, --only [value]', 'Whitelist for seeders')
  .option('-e, --except [value]', 'Blacklist for seeders')
  .option('-r, --reset [value]', 'Clear Database Before')
  .action((params) => {
    console.log(params);
    // console.log(params.only, params.except, params.reset);
    return new Seeder(params.only, params.except, params.reset);
  });


program.parse(process.argv);
