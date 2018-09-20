'use strict'
var Promise = require('bluebird')
var _ = require('lodash')
var mailService = require('../../util/mail/mailService')

class UserService {
  constructor (userRepository, activityRepo) {
    this.userRepository = userRepository
    this.activityRepo = activityRepo
  }

  checkUser (identity, tokens, ip) {
    let emails = identity.emails.map(email => {
      return email.value.trim().toLowerCase()
    })
    var user = this.userRepository.getUserByGoogleIdOrEmail(identity.id, emails)

    // var googleUserData;
    return new Promise((resolve, reject) => {
      user
        .then(response => {
          if (identity && identity.image && identity.image.url) {
            identity.image.url = identity.image.url.substring(0, identity.image.url.length - 6)
          }

          // googleUserData = response;
          if (response == null) {
            mailService.welcomeEmail(identity.emails[0].value, identity.name.givenName).catch(global.logger)
          }
          return Promise.resolve(response)
        })
        .then(googleUserData => {
          if (googleUserData == null) {
            return this.createUser(identity, tokens).then(user => Promise.resolve({ user, googleUserData }))
          } else {
            return this.updateUser(identity, tokens, googleUserData).then(user =>
              Promise.resolve({ user, googleUserData })
            )
          }
        })
        .then(({ user, googleUserData }) => {
          if (googleUserData == null) {
            // register activity
            this.activityRepo.registerActivity({
              actionType: this.activityRepo.actions.signup,
              actionId: user._id,
              userId: user._id,
              newItem: { meta: { ip } }
            })

            user.firstLogin = true
          } else {
            this.activityRepo.registerActivity({
              actionType: this.activityRepo.actions.signin,
              actionId: user._id,
              userId: user._id,
              newItem: { meta: { ip } }
            })
          }
          resolve(user)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  updateUser (identity, tokens, user) {
    const emails = identity.emails.map(i => {
      i.value = i.value.toLowerCase()
      return i
    })
    user.emails = emails

    if (user.auth === '') {
      user.auth = {}
    }
    user.auth = _.merge(user.toObject().auth, tokens)
    user.offlineAccess = !!user.auth.refresh_token
    user.image = identity.image
    user.name = identity.name
    user.verified = identity.verified
    user.language = identity.language
    user.domain = identity.domain

    if (user.status === 'Record') {
      user.status = 'Completed'
      user.googleId = identity.id
      user.createdTime = Date.now()
    }

    return user.save()
  }

  createUser (identity, tokens) {
    const emails = identity.emails.map(i => {
      i.value = i.value.toLowerCase()
      return i
    })
    let schema = {
      googleId: identity.id,
      emails: emails,
      auth: tokens,
      offlineAccess: !!tokens.refresh_token,
      image: identity.image,
      name: identity.name,
      verified: identity.verified,
      language: identity.language,
      domain: identity.domain,
      locale: identity.language
    }

    return this.userRepository.createUser(schema)
  }

  createRecordUser (email) {
    return this.userRepository.createUser({
      googleId: '',
      auth: '',
      emails: [
        {
          type: 'account',
          value: email.trim()
        }
      ],
      image: {
        isDefault: false,
        url: ''
      },
      name: {
        givenName: email,
        familyName: ''
      },
      verified: false,
      language: 'en',
      status: 'Record'
    })
  }

  getUserByEmail (userEmail) {
    return new Promise((resolve, reject) => {
      this.userRepository
        .getUserByEmail(userEmail)
        .then(function(response) {
          resolve(response)
        })
        .catch(reject)
    })
  }

  getUserByEmailWithAllStatus (userEmail) {
    return this.userRepository.getUserByEmailWithAllStatus(userEmail)
  }

  editFirstLogin (firstLoginBool, user) {
    return new Promise(resolve => {
      firstLoginBool = parseInt(firstLoginBool)
      user.firstLogin = firstLoginBool === 1
      user.save().then(() => {
        resolve('First Login edited')
      })
    })
  }

  editGanttTour (showedGanttTour, user) {
    user.showedGanttTour = showedGanttTour
    return user.save()
  }

  getUserByGoogleIdOrEmail (id) {
    return global.db.UserModel.findOne({
      $or: [{ googleId: id }, { 'emails.value': id.trim().toLowerCase() }]
    }).exec()
  }

  async getUserById (userId) {
    try {
      const info = await global.db.UserModel.getUserById(userId)
      const teams = await global.db.OrganizationModel.find({ 'members.member': userId, status: { $ne: 'deleted' } })
      return Promise.resolve({ info, teams })
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

module.exports = UserService
