const faker = require('faker')

class Seeder {
  static get model () {
    return 'userModel'
  }

  seed () {
    return [[MODEL]]
  }

  dummy () {
    return {
      quantity: 20,
      item: ({ index }) => ([MODEL])
    }
  }
}

module.exports = Seeder
