const faker = require('faker')

class Seeder {
  static get model () {
    return 'userModel'
  }

  seed () {
    const data = this.randomUsers()
    return [
      {
        firstName: 'Shalva',
        email: 'shalva.gegia@gmail.com',
        slug: 'asdasd',
        password: '123',
        role: 'superAdmin'
      },
      ...data
    ]
  }

  randomUsers () {
    const data = []
    for (let index = 0; index < 5; index++) {
      data.push({
        firstName: faker.name.findName(),
        email: faker.internet.email(),
        slug: faker.internet.email(),
        password: '123',
        role: 'superAdmin'
      })
    }
    return data
  }
}

module.exports = Seeder