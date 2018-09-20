var UserController = require('./userController')
// var UserModel = require('./userModel')
var UserRepository = require('./userRepository')
var UserService = require('./userService')
var getRouteV1 = require('./userRoute.v1')
var getRouteV = require('./adminRoute.v1')

module.exports = {
  UserController: UserController,
  // UserModel: UserModel,
  UserRepository: UserRepository,
  UserService: UserService,
  getRoute: function () {
    return getRouteV
  },
  getRouteV1: function () {
    return getRouteV1
  },
  initModel: (db, mongoose) => db.UserModel = require('./userModel')(mongoose)
}
