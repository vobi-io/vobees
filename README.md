# Vobi Cli
Command line tool for Vobi Backend

### Install
Install vobi-cli
```
npm install --save-dev vobi-cli
```

### Usage

Run command from project`s root folder

```
vobi-cli [command]
```

### Methods

| name | Options | description |
|------|---------|-------------|
| `generate:module` | - | Generate new module scaffolding for project|
| `create:module` | - | Include generic module into project |
| `make:seeder` | - | Make seeder scaffolding for project |
| `generate:seed` | - | Generate simple seeder file |
| `seed` | -r, -o, -e | Seed Database, `-r, --reset` clear db, `-o, --only seeder` whitelist for seed, `-e, --except seeder` blacklist for seed,  |
