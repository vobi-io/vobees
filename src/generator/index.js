import fs from 'fs';
import path from 'path';
import colors from 'colors';
import download from 'download';
import { copyDir, rmdir } from '../utils/helpers';

class GenerateProject {
  constructor(projectName) {
    this.projectName = projectName.trim();

    this.workingDirectory = process.cwd();
    this.appDirectory = `${this.workingDirectory}/${this.projectName}`;

    this.latestDownloadUrl = 'https://github.com/vobi-io/vobees-boilerplate/archive/master.zip';

    this.repositoryName = 'vobees-boilerplate';
    this.releaseName = '';

    this.generate();
  }

  createProjectFolder() {
    if (!fs.existsSync(this.appDirectory)) { fs.mkdirSync(this.appDirectory); }

    return true;
  }

  async downloadBoilerplate() {
    const dest = `${this.appDirectory}`;
    const url = this.latestDownloadUrl;
    return download(url, dest, { extract: true });
  }

  moveFiles(srcDir, destDir) {
    this.funcName = 'generate';
    return fs.readdirSync(srcDir).map((file) => {
      const destFile = path.join(destDir, file);
      console.log(destFile);
      return fs.readdirSync(path.join(srcDir, file), destFile).then(() => destFile);
    });
  }

  async unzipFile() {
    const src = `${this.appDirectory}/${this.repositoryName}-master/`;
    const dest = `${this.appDirectory}`;
    copyDir(src, dest);
  }

  async clear() {
    const src = `${this.appDirectory}/${this.repositoryName}-master/`;
    rmdir(src);
    const screenshots = `${this.appDirectory}/screenshots`;
    rmdir(screenshots);
  }

  async createProjectFiles() {
    this.log('Downloading latest version...');
    await this.downloadBoilerplate();
    this.log('Extracting Project files...');
    await this.unzipFile();
    this.log('Finishing...');
    await this.clear();
  }

  done() {
    this.funcName = 'done';
    this.log(`Project ${this.projectName} successfully created!`);
    this.log('To run project, cd into project directory and run:');
    this.log('');
    this.log(`cd ${this.projectName}`);
    this.log('yarn install');
    this.log('yarn start');
  }

  log(msg) {
    this.funcName = 'log';
    console.log(colors.green(msg));
  }

  async generate() {
    this.funcName = 'generate';
    const result = this.createProjectFolder();
    if (!result) {
      return console.log(colors.red(`Project ${this.projectName} already exists!`));
    }

    await this.createProjectFiles();


    return setTimeout(async () => {
      // await this.disconnectDb();
      this.done();
      process.exit();
    }, 500);
  }
}

module.exports = GenerateProject;
