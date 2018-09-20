const SecurityController = require('../security/securityController')
const DeviceController = require('./deviceController')

module.exports = {
  '/api/v1/device': {
    '/': {
      post: [
        SecurityController.isAuthenticated.bind(SecurityController),
        DeviceController.saveDeviceToUser.bind(DeviceController)
      ],
      delete: [
        SecurityController.isAuthenticated.bind(SecurityController),
        DeviceController.removeDeviceFromUser.bind(DeviceController)
      ]
    }
  }
}
