var Promise = require('bluebird')
var shortid = require('shortid')
var MyError = require('../../util/responses/errors')
var utils = require('../../util/Utils')

// var eduRegex =
module.exports = function (mongoose) {
  var Schema = mongoose.Schema
  var userSchema = new Schema({
    emails: [],
    name: {},
    auth: {},
    offlineAccess: { type: Boolean, default: false },
    image: {},
    language: { type: String },
    domain: { type: String },
    verified: { type: Boolean },
    googleId: { type: String },
    status: { type: String, default: 'Completed' },
    role: { type: String, default: 'user', enum: ['user', 'superAdmin', 'stuff'] },
    createdTime: { type: Date, default: Date.now },
    modifiedTime: { type: Date },
    version: { type: Number }, // version is increasing by update date
    syncToken: { type: String }, // change when changed

    firstLogin: { type: Boolean, default: 'true' }, // First Login flag... To handle The tour!
    showedGanttTour: { type: Boolean, default: false },
    locale: { type: String, default: 'en' },
    stripeCustomerId: { type: String },
    companies: [{ type: Schema.Types.ObjectId, ref: 'Company' }],
    notificationSettings: {
      isDesktop: { type: Boolean, default: true },
      isEmail: { type: Boolean, default: true },
      isTeamInvitation: { type: Boolean, default: true },
      isWeeklyReport: { type: Boolean, default: true }
    }
  })

  userSchema.index({ googleId: 1 })
  userSchema.index({ 'emails.value': 1 })
  userSchema.index({ 'emails.value': 1, googleId: 1 })
  userSchema.index({ 'createdTime': 1 })
  userSchema.index({ 'domain': 1 })
  userSchema.index({ 'status': 1, 'createdTime': 1 })
  userSchema.index({ 'emails.0.value': 1 })

  userSchema.pre('save', function (next) {
    this.version = +new Date()
    this.modifiedTime = Date.now()
    this.syncToken = shortid.generate()
    next()
  })

  userSchema.methods.toJSON = function () {
    var obj = this.toObject()
    // remove props that should not be exposed
    delete obj.auth
    delete obj.__v
    delete obj.googleId
    delete obj.verified

    obj.fullName = (obj.name !== undefined) ? `${obj.name.givenName} ${obj.name.familyName}`.trim() : ''
    obj.email = (obj.emails !== undefined && obj.emails.length > 0) ? obj.emails[0].value : ''

    return obj
  }

  userSchema.methods.toMember = function () {
    var obj = this.toObject()
    // remove props that should not be exposed
    delete obj.auth
    delete obj.__v
    delete obj.googleId
    delete obj.verified
    delete obj.stripeCustomerId
    delete obj.offlineAccess

    obj.fullName = (obj.name !== undefined) ? `${obj.name.givenName} ${obj.name.familyName}`.trim() : ''
    obj.email = (obj.emails !== undefined && obj.emails.length > 0) ? obj.emails[0].value : ''
    obj._id = obj._id.toString()
    return obj
  }

  userSchema.virtual('email').get(function () {
    return (this.emails !== undefined && this.emails.length > 0) ? this.emails[0].value : ''
  })

  userSchema.virtual('fullName').get(function () {
    return (this.name !== undefined) ? `${this.name.givenName} ${this.name.familyName}`.trim() : ''
  })
  userSchema.virtual('firstName').get(function () {
    return (this.name !== undefined) ? this.name.givenName : ''
  })

  userSchema.virtual('isEduDomain').get(function () {
    return !!((this.domain && utils.isEduDomain(this.domain)))
  })

  userSchema.virtual('isGlobalDomain').get(function () {
    return !!((this.domain && utils.isGlobalDomain(this.domain)))
  })

  userSchema.virtual('generateDomain').get(function () {
    let generateDomain = this.domain
    const email = (this.emails !== undefined && this.emails.length > 0) ? this.emails[0].value : this._id.toString()

    if (generateDomain && utils.isEduDomain(generateDomain)) {
      generateDomain = email
    }

    if (generateDomain && utils.isGlobalDomain(generateDomain)) {
      generateDomain = email
    }

    return (generateDomain || email).toLowerCase()
  })

  userSchema.statics.getEmailsByIds = function (ids) {
    return this.find({ _id: { $in: ids } }, 'emails.value')
      .exec()
      .then((users) => {
        const result = users.map((user) => {
          return user.email
        })
        return Promise.resolve(result)
      })
  }

  userSchema.statics.getUserById = function (userId) {
    return this.findOne({ _id: userId })
      .exec()
      .then((user) => {
        if (!user || !user._id) {
          return MyError.notFoundPromise('User not found', MyError.level.INFO)
        }

        return Promise.resolve(user)
      })
  }

  userSchema.statics.getUserByEmail = function (email) {
    return this.findOne({ emails: { $elemMatch: { value: email } }, status: {$ne: 'deleted'} })
      .exec()
      .then((user) => {
        if (!user || !user._id) {
          return MyError.notFoundPromise('User not found', MyError.level.INFO)
        }

        return Promise.resolve(user)
      })
  }

  return mongoose.model('User', userSchema)
}
