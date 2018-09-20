'use strict'

class UserRepository {
  getUserByGoogleIdOrEmail (id, emails) {
    return global.db.UserModel.findOne({
      $or: [{'googleId': id}, {'emails.value': {$in: emails}}],
      status: {$ne: 'deleted'}
    }).exec()
  }

  createUser (user) {
    let newUser = new global.db.UserModel(user)
    return newUser.save()
  }

  getUserByEmail (userEmail) {
    return global.db.UserModel.findOne({
      'emails.value': userEmail.trim().toLowerCase(),
      status: {$ne: 'deleted'}
    }).exec()
  }

  getUserByEmailWithAllStatus (userEmail) {
    return global.db.UserModel.findOne({
      'emails.value': userEmail.trim().toLowerCase()
    }).exec()
  }
}

module.exports = UserRepository
