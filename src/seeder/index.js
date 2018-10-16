import fs from 'fs';
import path from 'path';
import colors from 'colors';

class Seeder {
  constructor(only = '', except = '', reset = false) {
    this.only = only.toLocaleLowerCase().trim();
    this.except = except.toLocaleLowerCase().trim();
    this.reset = reset;
    this.modules = [];

    const RootSeeder = path.join(__dirname, '/seed/index');

    this.RootSeeder = RootSeeder;

    this.init();
  }

  async setSeedModules() {
    let modules;
    if (this.only) {
      modules = this.only;
    } else if (this.except) {
      modules = this.except;
    } else {
      modules = this.RootSeeder.seeders;
    }

    this.modules = modules;
  }

  async clearDatabase() {
    if (this.reset) {
      console.log('test');
    }
  }

  async seedModule(seederPath) {
    const seeder = require(seederPath);

    console.log(seeder.seed);

    if (this.modules) {
      return seeder.seed;
    }

    return false;
  }

  async seedModules() {
    this.modules.forEach(async (item) => {
      const module = item.toLowerCase();
      const seeder = path.join(__dirname, `/seed/${module}.js`);
      if (!fs.existsSync(seeder)) {
        console.log(colors.red(`Seeder for module: ${module} does not exists, skipping...`));
      } else {
        await this.seedModule(seeder);
      }
    });
  }

  async init() {
    await this.setSeedModules();
    await this.clearDatabase();
    await this.seedModules();

    return console.log(colors.green('Database successfully seeded!'));
  }
}

module.exports = Seeder;
