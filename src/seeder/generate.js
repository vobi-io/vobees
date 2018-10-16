/* eslint import/named:0 */

import fs from 'fs';
import path from 'path';
import colors from 'colors';

class CreateModule {
  constructor(seederName) {
    this.seederName = seederName.trim();

    this.workingDirectory = process.cwd();
    this.seedDirectory = `${this.workingDirectory}/seed`;

    this.create();
  }

  checkSeedFolder() {
    if (!fs.existsSync(this.seedDirectory)) { fs.mkdirSync(this.seedDirectory); }
    return true;
  }


  copySeedFile() {
    const templatesDirectory = path.join(__dirname, '../../templates/');

    const templatePath = `${templatesDirectory}/seed/user.js`;

    const filePath = `${this.seedDirectory}/${this.seederName}.js`;

    const contents = fs.readFileSync(templatePath, 'utf8');
    // contents = contents.split('[UModule]').join(UModule);
    // contents = contents.split('[LModule]').join(LModule);

    fs.writeFileSync(filePath, contents);


    return filePath;
  }

  create() {
    const result = this.checkSeedFolder();
    if (!result) {
      return console.log(colors.red('Seeder scaffolding does not  exists!'));
    }

    this.copySeedFile();

    return console.log(colors.green(`Seeder ${this.seederName} successfully created!`));
  }
}

module.exports = CreateModule;
