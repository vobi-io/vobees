'use strict'
var UserService = require('../user/userService')
var UserRepository = require('../user/userRepository')
var ActivityRepository = require('../activity/activityRepository')

var SecurityController = require('../security').SecurityController
var Promise = require('bluebird')
var MyError = require('../../util/responses/errors')
// var mailService = require('../../util/mail/mailService')
var reportDetailedError = require('../../util/logger/report')
const requestIp = require('request-ip')
var GEmail = require('../google').GEmail
var mailService = require('../../util/mail/mailService')

class UserController {
  constructor (userService, activityRepo) {
    this.userService = userService
    this.securityController = SecurityController
    this.activityRepo = activityRepo
  }

  getUserByEmail (userEmail) {
    return new Promise((resolve, reject) => {
      if (!userEmail) {
        return reject(MyError.badRequest('Missing values', MyError.level.ERROR))
      }

      this.userService.getUserByEmail(userEmail)
        .then(resolve)
        .catch(reject)
    })
  }

  /**
   *  Get User by email from database oor Create and send invitation to Email if not exist
   * @param {string} userEmail // User email
   * @param {string} OrganizationName //organizationId Name, it need when user does not exist in database
   * @param {object} senderUser //User object, it need when user does not exist in database
   * @constructor
   */
  getOrCreateUser (userEmail) {
    return new Promise((resolve, reject) => {
      if (!userEmail) {
        return reject(MyError.badRequest('Missing values', MyError.level.ERROR))
      }

      var userData = null

      this.userService.getUserByEmail(userEmail)
        .then((existUser) => {
          if (!existUser) {
            return this.userService.createRecordUser(userEmail)
          } else {
            userData = existUser
            return Promise.SUCCESS
          }
        })
        .then((nUser) => {
          if (userData == null) {
            userData = nUser
          }

          // mailService.organizationInvitation(OrganizationName, userData)

          return resolve(userData)
        })
        .catch(reject)
      // .then(()=>{
      //   resolve(userData)
      // })
    })
  }

  editTour (req, res) {
    const { tour } = req.body
    if (typeof tour === 'undefined') {
      return res.catchError(MyError.badRequest('Missing values', MyError.level.WARNING))
    }

    this.userService.editFirstLogin(tour, req.user)
      .then(res.ok)
      .catch((err) => {
        res.catchError(err)
      })
  }

  editGanttTour (req, res) {
    const { tour } = req.body
    if (tour == 'undefined') {
      return res.catchError(MyError.badRequest('Missing values: tour', MyError.level.WARNING))
    }

    this.userService.editGanttTour(tour, req.user)
      .then(res.ok)
      .catch((err) => {
        res.catchError(err)
      })
  }

  logger (req, res) {
    const { error } = req.body
    res.ok('done')
    reportDetailedError(error, req, res, { group: 'frontend', functionName: error.functionName })
  }

  getIp (req, res) {
    const clientIp = requestIp.getClientIp(req)
    res.ok({ ip: clientIp })
  }

  deleteAccount (req, res) {
    req.user.status = 'deleted'
    req.user.googleId = `deleted_${req.user.googleIds}`
    req.user.save()
      .then(() => {
        res.ok('deleted')
      })
      .catch((err) => {
        res.catchError(err)
      })
  }

  disableAccount (req, res) {
    req.user.status = 'disabled'
    req.user.save()
      .then(() => {
        res.ok('Updated')
      })
      .catch((err) => {
        res.catchError(err)
      })
  }

   /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/users/notifications Update notifications
   * @apiName updateNotifications
   * @apiGroup Task
   * @apiPermission Authorization
   * @apiDescription  Update notifications
   *
   *
   * @apiParam {Bool} isDesktop Desktop notification.
   * @apiParam {Bool} isEmail Email notification.
   * @apiParam {Bool} isTeamInvitation Team invitation notification
   * @apiParam {Bool} isWeeklyReport Weekly report notification
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 200 OK
   *     {
   *        code: 'OK',
   *        message: 'Operation is successfully executed',
   *        data : {
   *          "_id": "4f1d4330-9557-11e6-82f5-4d8d1b1c5c1e",
   *          "status" : 'deleted'
   *        }
   *     }
   *
   * @apiUse Errors
   */
  updateNotifications (req, res) {
    const {isDesktop, isEmail, isTeamInvitation, isWeeklyReport} = req.body

    const {user} = req
    if (!user.notificationSettings) {
      user.notificationSettings = {}
    }
    if (isDesktop !== undefined) {
      user.notificationSettings.isDesktop = isDesktop
    }
    if (isEmail !== undefined) {
      user.notificationSettings.isEmail = isEmail
    }
    if (isTeamInvitation !== undefined) {
      user.notificationSettings.isTeamInvitation = isTeamInvitation
    }
    if (isWeeklyReport !== undefined) {
      user.notificationSettings.isWeeklyReport = isWeeklyReport
    }
    user.save()
      .then(() => {
        res.ok('Updated')
      })
      .catch((err) => {
        res.catchError(err)
      })
  }

  editLanguage (req, res) {
    const { locale } = req.body
    if (!locale) {
      return res.catchError(MyError.badRequest('Missing values', MyError.level.WARNING))
    }

    // register activity
    this.activityRepo.registerActivity({
      actionType: this.activityRepo.actions.changeLanguage,
      actionId: req.user._id,
      userId: req.user._id,
      newItem: { meta: { newLocal: locale } },
      oldItem: { locale: req.user.locale || req.user.language }
    })

    req.user.locale = locale

    req.user.save()
      .then(() => {
        res.ok('updated ')
      })
      .catch((err) => {
        res.catchError(err)
      })
  }

  getUserById (req, res) {
    const { userId } = req.query
    this.userService.getUserById(userId)
      .then(res.ok)
      .catch(res.catchError)
  }

  async sendEmailToUser (req, res) {
    const { emails, subject, description } = req.body

    var promises = emails.map(email => {
      mailService.sendEmail({
        email,
        subject,
        description
      })
    })

    promises.then(res.ok)
    .catch(res.catchError)
  }
}

module.exports = new UserController(new UserService(new UserRepository(), new ActivityRepository()), new ActivityRepository())
