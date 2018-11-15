#!/usr/bin/env node

/**
 * Module dependencies.
 */


import program from 'commander';
import colors from 'colors';
import fs from 'fs';
import { prompt } from 'inquirer';
import Types from './types';
import GenerateModule from './generate';
import CreateModule from './create';
import Seeder from './seeder';
import MakeSeeder from './seeder/MakeSeeder';
import GenerateSeeder from './seeder/generate';
import GenerateProject from './generator';


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
  .command('make:seeder')
  .alias('a')
  .description('Create Module')
  .action(() => new MakeSeeder());

program
  .command('seed')
  .alias('s')
  .description('Seed')
  .option('-o, --only [value]', 'Whitelist for seeders')
  .option('-e, --except [value]', 'Blacklist for seeders')
  .option('-r, --reset [value]', 'Clear Database Before')
  .action((params) => {
    const configPath = `${process.cwd()}/src/config`;
    const configs = fs.readdirSync(configPath);
    const choices = configs.map(item => item.split('.js')[0]).filter(item => item !== 'index' && item !== 'default');
    prompt([{
      type: 'list',
      name: 'configName',
      message: 'Choose Config for Database Seeding:',
      choices,
    }])
      .then(answers => new Seeder(params.only, params.except, params.reset, answers.configName));
  });

program
  .command('generate:seed')
  .alias('a')
  .description('Generate New Module')
  .action(() => {
    prompt([{
      type: 'input',
      name: 'seederName',
      message: 'Enter Seeder Name:',
    }, {
      type: 'input',
      name: 'modelName',
      message: 'Enter Model Name To Generate boilerplate (optional):',
    }])
      .then((answers) => {
        if (!answers.seederName) {
          return console.log(colors.red('You must enter seed name'));
        }
        return new GenerateSeeder(answers.seederName, answers.modelName);
      });
  });

program
  .command('new <projectName>')
  .option('-n, --new', 'New project')
  .action((projectName, cmd) => new GenerateProject(projectName));

program.parse(process.argv);
