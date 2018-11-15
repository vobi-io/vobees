/* eslint import/named:0 */

import fs from 'fs';
import path from 'path';
import colors from 'colors';
import { copyDir, projectConfig } from '../utils/helpers';

class CreateModule {
  constructor(moduleName) {
    this.moduleName = moduleName.trim();
    const LModule = this.moduleName.charAt(0).toLowerCase() + this.moduleName.slice(1);
    this.LModule = LModule;

    this.workingDirectory = process.cwd();
    this.appDirectory = `${this.workingDirectory}/${projectConfig().appPath}`;
    this.modulesDirectory = `${this.appDirectory}/modules`;
    this.newModuleDirectory = `${this.modulesDirectory}/${LModule}`;

    this.create();
  }

  checkModuleFolder() {
    if (!fs.existsSync(this.appDirectory)) { fs.mkdirSync(this.appDirectory); }

    if (!fs.existsSync(this.modulesDirectory)) { fs.mkdirSync(this.modulesDirectory); }

    if (fs.existsSync(this.newModuleDirectory)) {
      return false;
    }

    return true;
  }


  copyModuleFiles() {
    const templatesDirectory = path.join(__dirname, '../../templates/modules');
    const src = `${templatesDirectory}/${this.LModule}`;
    const dest = `${this.modulesDirectory}/${this.LModule}`;

    copyDir(src, dest);
  }

  create() {
    const result = this.checkModuleFolder();
    if (!result) {
      return console.log(colors.red(`Module ${this.moduleName} already exists!`));
    }

    this.copyModuleFiles();

    return console.log(colors.green(`Module ${this.moduleName} successfully created!`));
  }
}

module.exports = CreateModule;
