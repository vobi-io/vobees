var Promise = require('bluebird')

class DeviceRepository {

  saveDeviceToUser (userId, device) {
    const { token } = device
    return new Promise(async(resolve, reject) => {
      let result = await global.db.DeviceModel.findOne({ user: userId, token: token })

      if (!result) {
        const data = {
          ...device,
          user: userId,
          lastLogin: new Date()
        }
        let newDevice = new global.db.DeviceModel(data)
        await newDevice.save()
        return resolve()
      }

      result.status = 'active'
      result.lastLogin = new Date()
      await result.save()

      resolve()
    })
  }

  removeDeviceFromUser (userId, device) {
    const { token } = device
    return new Promise(async(resolve, reject) => {
      let result = await global.db.DeviceModel.findOne({ user: userId, token: token })

      if (!result) {
        return resolve()
      }

      result.status = 'inactive'
      result.lastLogout = new Date()
      await result.save()

      resolve()
    })
  }

}

module.exports = DeviceRepository
