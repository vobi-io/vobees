var DeviceRepository = require('./deviceRepository')
var DeviceModel = require('./deviceModel')
var DeviceRouteV1 = require('./deviceRoute.v1')
var DeviceController = require('./deviceController')

module.exports = {
  DeviceRepository: DeviceRepository,
  DeviceModel: DeviceModel,
  DeviceController: DeviceController,
  getRoute: function () {
    return null
  },
  getRouteV1: function () {
    return DeviceRouteV1
  },
  initModel: (db, mongoose) => db.DeviceModel = require('./deviceModel')(mongoose)
}
