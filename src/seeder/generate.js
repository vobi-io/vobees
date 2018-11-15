/* eslint import/named:0 */

import fs from 'fs';
import path from 'path';
import colors from 'colors';
import _ from 'lodash';
import { projectConfig } from '../utils/helpers';

class CreateModule {
  constructor(seederName, modelName) {
    this.seederName = seederName.trim();
    this.modelName = (modelName || '').trim();

    this.workingDirectory = process.cwd();
    this.seedDirectory = `${this.workingDirectory}/${projectConfig().seedPath}`;

    this.create();
  }

  checkSeedFolder() {
    if (!fs.existsSync(this.seedDirectory)) { fs.mkdirSync(this.seedDirectory); }
    return true;
  }

  getValue(key) {
    let result = null;
    const fieldName = key.toLowerCase();
    switch (fieldName) {
      case 'firstname':
      case 'first_name':
        result = 'faker.name.firstName()';
        break;
      case 'lastname':
      case 'last_name':
        result = 'faker.name.lastName()';
        break;
      case 'phone':
      case 'phonenumber':
      case 'phone_number':
      case 'mobile':
      case 'mobilenumber':
      case 'mobile_number':
        result = 'faker.phone.phoneNumber()';
        break;
      case 'address':
        result = 'faker.address.streetName()';
        break;
      case 'email':
        result = 'faker.internet.email()';
        break;
      case 'avatar':
        result = 'faker.internet.avatar()';
        break;
      case 'image':
      case 'photo':
        result = 'faker.random.image()';
        break;
      case 'number':
        result = 'faker.random.number()';
        break;
      case 'birthDate':
        result = 'faker.date.past()';
        break;
      case 'description':
        result = 'faker.lorem.words()';
        break;
      case 'count':
      case 'total':
        result = 'faker.random.number()';
        break;

      default:
        result = null;
        break;
    }

    const data = this.connection;

    return result;
  }

  async fillContent(contents) {
    let newContent = contents;
    if (!this.modelName) {
      newContent = newContent.split('[MODEL]').join(`{
        firstName: faker.name.findName()
      }`);
    } else {
      const defaultConfigPath = `${process.cwd()}/src/config/default`;
      const defaultConfig = require(defaultConfigPath);
      const { connection } = defaultConfig.database;

      const db = `${this.workingDirectory}/src/db`;
      const mongoose = require(db)(connection, ' Seed');
      const modelPath = `${this.workingDirectory}/src/modules/${this.modelName}`;
      if (fs.existsSync(`${modelPath}.js`)) {
        const Model = require(modelPath)(mongoose);
        const flatFieldNames = _.without(Object.keys(Model.schema.paths), '_id', '__v').sort();

        let json = {};
        flatFieldNames.map((fieldName) => {
          const key = fieldName;
          const value = null;

          const nestedKeys = fieldName.split('.');

          if (nestedKeys.length > 1) {
            const lastKey = nestedKeys[nestedKeys.length - 1];
            json = _.set(json, fieldName, this.getValue(lastKey));
          } else {
            json[key] = this.getValue(key);
          }
        });
        const schema = JSON.stringify(json, undefined, 2);

        newContent = newContent.split('[MODEL]').join(schema);
      }
    }
    return newContent;
  }

  async copySeedFile() {
    const templatesDirectory = path.join(__dirname, '../../templates/');

    const templatePath = `${templatesDirectory}/seed/user.js`;

    const filePath = `${this.seedDirectory}/${this.seederName}.js`;

    let contents = fs.readFileSync(templatePath, 'utf8');

    contents = await this.fillContent(contents);
    // contents = contents.split('[UModule]').join(UModule);
    // contents = contents.split('[LModule]').join(LModule);

    fs.writeFileSync(filePath, contents, null, 4);


    return filePath;
  }

  async create() {
    const result = this.checkSeedFolder();
    if (!result) {
      return console.log(colors.red('Seeder scaffolding does not  exists!'));
    }

    await this.copySeedFile();


    setTimeout(async () => {
      // await this.disconnectDb();
      console.log(colors.green(`Seeder ${this.seederName} successfully created!`));
      process.exit();
    }, 500);
  }
}

module.exports = CreateModule;
