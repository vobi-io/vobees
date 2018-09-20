#!/usr/bin/env node
'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _inquirer = require('inquirer');

var _types = require('./types');

var _types2 = _interopRequireDefault(_types);

var _generate = require('./generate');

var _generate2 = _interopRequireDefault(_generate);

var _create = require('./create');

var _create2 = _interopRequireDefault(_create);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Module dependencies.
 */

_commander2.default.version('0.0.1').description('Vobi Command Line Tool');

_commander2.default.command('generate:module').alias('a').description('Generate New Module').action(function () {
  (0, _inquirer.prompt)([{
    type: 'input',
    name: 'moduleName',
    message: 'Enter Module Name:'
  }]).then(function (answers) {
    if (!answers.moduleName) {
      return console.log(_colors2.default.red('You must enter module name'));
    }
    return new _generate2.default(answers.moduleName);
  });
});

_commander2.default.command('create:module').alias('a').description('Create Module').action(function () {
  (0, _inquirer.prompt)([{
    type: 'list',
    name: 'moduleName',
    message: 'Choose Module:',
    choices: _types2.default.modules
  }]).then(function (answers) {
    if (!answers.moduleName) {
      return console.log(_colors2.default.red('You must choose module'));
    }
    return new _create2.default(answers.moduleName);
  });
});

_commander2.default.parse(process.argv);