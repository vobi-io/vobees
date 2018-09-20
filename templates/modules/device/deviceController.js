var DeviceRepository = require('./deviceRepository')
var MyError = require('../../util/responses/errors')

class DeviceController {
  constructor (deviceRepository) {
    this.deviceRepository = deviceRepository
  }

  saveDeviceToUser (req, res) {
    const {body: device, user: {_id}} = req

    this.deviceRepository.saveDeviceToUser(_id, device)
    .then(res.ok)
    .catch(res.catchError)
  }

  removeDeviceFromUser (req, res) {
    const {body: device, user: {_id}} = req

    this.deviceRepository.removeDeviceFromUser(_id, device)
    .then(res.ok)
    .catch(res.catchError)
  }

}

module.exports = new DeviceController(new DeviceRepository())
