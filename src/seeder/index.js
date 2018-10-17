import fs from 'fs';
import colors from 'colors';

const { forEach } = require('p-iteration');

class Seeder {
  constructor(only = '', except = '', reset = false, configName) {
    this.only = only.toLocaleLowerCase().trim();
    this.except = except.toLocaleLowerCase().trim();
    this.reset = reset;
    this.modules = [];

    this.workingDirectory = process.cwd();

    const configPath = `${process.cwd()}/src/config/${configName}`;
    const defaultConfigPath = `${process.cwd()}/src/config/default`;

    const defaultConfig = require(defaultConfigPath);
    const selectedConfig = require(configPath);

    const config = Object.assign({}, defaultConfig, selectedConfig);

    this.connection = config.database.connection;

    const RootSeeder = require(`${this.workingDirectory}/seed`);
    this.rootSeeder = RootSeeder;

    this.mongoose = null;
    this.modules = [];

    this.models = {};

    this.init();
  }

  async setSeedModules() {
    let modules = [];
    if (this.only) {
      modules = [this.only];
    } else if (this.except) {
      modules = [this.except];
    } else {
      modules = this.rootSeeder.seeders;
    }

    this.modules = modules;
  }

  async fillReferencedFields(item) {
    const data = {};

    await forEach(item.__refs, async (refItem) => {
      const {
        field, select, model, query,
      } = refItem;

      const refModel = this.models[model];
      if (refModel) {
        const result = await refModel.findOne(query);

        if (result) {
          if (Array.isArray(select)) {
            // const fields
            data[field] = [result];
          } else {
            const value = select;
            data[field] = result[value];
          }
        }
      }
    });

    return data;
  }

  seedModule(seederPath, module) {
    return new Promise(async (resolve, rejects) => {
      const seeder = require(seederPath);
      const SeederClass = new seeder();

      const seeds = [];
      let dummyData = {
        quantity: 0,
      };

      // Generate Static Seed Data
      if (SeederClass.seed) {
        await forEach(SeederClass.seed(), async (item) => {
          let newItem = item;

          if (newItem.__refs) {
            const relationships = await this.fillReferencedFields(newItem);

            newItem = Object.assign({}, newItem, relationships);
          }

          seeds.push(newItem);
        });
      }

      // Generate Dummy Data
      if (SeederClass.dummy) {
        dummyData = SeederClass.dummy();
        dummyData.data = [];

        for (let i = 0; i < dummyData.quantity; i++) {
          let newDummyItem = dummyData.item({ index: i });
          if (newDummyItem.__refs) {
            const relationships = await this.fillReferencedFields(newDummyItem);
            newDummyItem = Object.assign({}, newDummyItem, relationships);
          }

          dummyData.data.push(newDummyItem);
        }
      }

      const Model = require(`${this.workingDirectory}/src/modules/${module}/${seeder.model}`)(this.mongoose);

      this.models[seeder.model] = Model;

      if (this.reset) {
        await Model.remove({}).exec();
      }

      await Model.insertMany(seeds);

      if (dummyData.data && dummyData.data.length) {
        await Model.insertMany(dummyData.data);
      }

      setTimeout(() => {
        resolve();
      }, 100);
    });
  }

  async seedModules() {
    for (let index = 0; index < this.modules.length; index++) {
      const item = this.modules[index];

      const module = item.toLowerCase();
      // const seeder = path.join(__dirname, `/seed/${module}.js`);
      const seeder = `${this.workingDirectory}/seed/${module}.js`;
      if (!fs.existsSync(seeder)) {
        console.log(colors.red(`Seeder for module: ${module} does not exists, skipping...`));
      } else {
        await this.seedModule(seeder, module);
      }
    }
  }

  async connectDB() {
    const db = `${this.workingDirectory}/src/db`;
    const mongoose = require(db)(this.connection, ' Seed');
    this.mongoose = mongoose;
  }

  async disconnectDb() {
    await this.mongoose.disconnect();
  }

  async init() {
    await this.setSeedModules();
    await this.connectDB();

    await this.seedModules();

    setTimeout(async () => {
      // await this.disconnectDb();
      console.log(colors.green('Database successfully seeded!'));
      process.exit();
    }, 500);
  }
}

module.exports = Seeder;
