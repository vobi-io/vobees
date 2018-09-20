module.exports = function (mongoose) {
  var Schema = mongoose.Schema

  var deviceSchema = new Schema({

    platform: {
      ios: {
        model: { type: String },
        userInterfaceIdiom: { type: String },
        platform: { type: String },
        systemVersion: { type: String },
        buildNumber: { type: String }
      }
    },

    deviceYearClass: { type: String },
    deviceName: { type: String },
    deviceId: { type: String },

    manifest: {
      version: { type: String },
      sdkVersion: { type: String }
    },

    token: { type: String, required: true },

    user: { type: Schema.Types.ObjectId, ref: 'User' },
    lastLogin: {type: Date},
    lastLogout: {type: Date},

    status: { type: String, default: 'active', enum: ['active', 'inactive'] },
    createdTime: { type: Date, default: Date.now },
    modifiedTime: { type: Date },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    version: { type: Number }, // version is increasing by update date
    syncToken: { type: String } // change when changed
  })

  // deviceSchema.index({ 'projectId': 1 })

  deviceSchema.pre('save', function (next) {
    this.version = +new Date()
    this.modifiedTime = Date.now()
    next()
  })

  deviceSchema.methods.toJSON = function () {
    var obj = this.toObject()
    // remove props that should not be exposed
    delete obj.__v

    return obj
  }

  return mongoose.model('device', deviceSchema)
}
