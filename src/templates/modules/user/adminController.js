'use strict'
var UserService = require('../user/userService')
var PlanRepository = require('../company/planRepository')
var UserRepository = require('../user/userRepository')
var OrganizationRepository = require('../organization/organizationRepository')
var projectModule = require('../project')
var ActivityRepository = require('../activity/activityRepository')
var {getCompanyRepo} = require('../company')
var moment = require('moment')

var SecurityController = require('../security').SecurityController
// var MyError = require('../../util/responses/errors')
var config = require('app/config')
// const requestIp = require('request-ip')

class AdminController {
  constructor (userService) {
    this.db = global.db
    this.userService = userService
    this.planRepository = new PlanRepository({db: this.db, activityRepo: new ActivityRepository()})
    this.UserRepository = new UserRepository()
    this.organizationRepository = new OrganizationRepository()
    this.projectRepository = projectModule.getRepo(this.db)
    this.securityController = SecurityController
    this.companyRepository = getCompanyRepo(global.db)
  }

  async getUserInfo (req, res) {
    const {
      email
    } = req.query
    try {
      const user = await this.userService.getUserByEmailWithAllStatus(email)
      if (!user) {
        return res.badRequest('User not found!')
      }
      const {
        _id: userId,
        generateDomain
      } = user
      const teamsP = global.db.OrganizationModel.find({
        'members.member': userId
      }).populate('members.member').populate('owner')

      const domainTeamsP = global.db.OrganizationModel.find({
        'members.member': {
          $ne: userId
        },
        userDomain: generateDomain
      }).populate('members.member').populate('owner')

      const plansP = global.db.CompanyModel.getCompaniesByUser(user,
         ['currentPlan.billedTeams', 'currentPlan.billedTeams', 'owner'])
      const projectsP = global.db.ProjectModel.find({
        'members.member': userId
      }).populate('members.member').populate('owner')

      var promises = [teamsP, domainTeamsP, plansP, projectsP]

      var [teams, domainTeams, plans, projects] = await Promise.all(promises)
      projects.map(p => p.owner = p.getOwner())
      res.ok({
        user,
        teams,
        domainTeams,
        plans,
        projects
      })
    } catch (err) {
      res.catchError(err)
    }
  }

  async getUsersCount (req, res) {
    let { groupBy, startDate, endDate, byCompany, includeGmail } = req.query
    byCompany = byCompany === 'true'
    // includeGmail = includeGmail === 'true'
    try {
      let project = { 'y': { '$year': '$createdTime' } }
      let group = { 'year': '$y' }
      let sort = { '_id.year': 1 }

      switch (groupBy) {
        case 'daily':
          project = {
            'y': { '$year': '$createdTime' },
            'm': { '$month': '$createdTime' },
            'd': { '$dayOfMonth': '$createdTime' }
          }
          group = {
            'year': '$y',
            'month': '$m',
            'day': '$d'
          }
          sort = { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
          break
        case 'monthly':
          project = {
            'y': { '$year': '$createdTime' },
            'm': { '$month': '$createdTime' }
          }
          group = {
            'year': '$y',
            'month': '$m'
          }
          sort = { '_id.year': 1, '_id.month': 1 }
          break
        case 'weekly':
          project = {
            'y': { '$year': '$createdTime' },
            'w': { '$week': '$createdTime' }
          }
          group = {
            'year': '$y',
            'week': '$w'
          }
          sort = { '_id.year': 1, '_id.week': 1 }
          break
        case 'yearly':
          project = { 'y': { '$year': '$createdTime' } }
          group = { 'year': '$y' }
          sort = { '_id.year': 1 }
          break
        default: project
      }

      if (!endDate) {
        endDate = new Date()
      }
      let match = {
        status: 'Completed',
        createdTime: { $gte: new Date(startDate), $lt: new Date(endDate) }
      }

      let groupByCompany = null
      if (byCompany) {
        project['domain'] = '$domain'
        var groupNew = {}
        Object.keys(group).map((k) => {
          groupNew[k] = `$_id.${k}`
        })
        groupByCompany = {
          '$group': {
            '_id': groupNew,
            'companyCount': { '$sum': 1 },
            'userCount': {'$sum': '$userCount'}
          }
        }
        group['domain'] = '$domain'
      }

      if (includeGmail !== undefined && includeGmail === 'false') {
        match['domain'] = {$ne: null}
      }

      var query = [
        {
          '$match': match
        },
        { '$project': project },
        {
          '$group': {
            '_id': group,
            'userCount': { '$sum': 1 }
          }
        }
      ]
      if (byCompany) { query.push(groupByCompany) }
      query.push({ $sort: sort })

      const users = await global.db.UserModel.aggregate(query)
      res.ok(users)
    } catch (err) {
      res.catchError(err)
    }
  }

  async getUniqueUsers (req, res) {
    let { groupBy, startDate, endDate } = req.query
    try {
      let project = { 'y': { '$year': '$created' } }
      let group = { 'year': '$y' }
      let sort = { '_id.year': 1 }

      switch (groupBy) {
        case 'daily':
          project = {
            'y': { '$year': '$created' },
            'm': { '$month': '$created' },
            'd': { '$dayOfMonth': '$created' }
          }
          group = {
            'year': '$y',
            'month': '$m',
            'day': '$d'
          }
          sort = { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
          break
        case 'monthly':
          project = {
            'y': { '$year': '$created' },
            'm': { '$month': '$created' }
          }
          group = {
            'year': '$y',
            'month': '$m'
          }
          sort = { '_id.year': 1, '_id.month': 1 }
          break
        case 'weekly':
          project = {
            'y': { '$year': '$created' },
            'w': { '$week': '$created' }
          }
          group = {
            'year': '$y',
            'week': '$w'
          }
          sort = { '_id.year': 1, '_id.week': 1 }
          break
        case 'yearly':
          project = { 'y': { '$year': '$created' } }
          group = { 'year': '$y' }
          sort = { '_id.year': 1 }
          break
        default: project
      }

      if (!endDate) {
        endDate = new Date()
      }
      let match = {
        created: { $gte: new Date(startDate), $lt: new Date(endDate) }
      }

      var secondGroup = {}
      Object.keys(group).map(i => {
        secondGroup[i] = `$_id.${i}`
      })
      var query = [
        {
          '$match': match
        },
        { '$project': {
          ...project,
          actionUser: '$actionUser'
        } },
        {
          '$group': {
            '_id': {
              ...group,
              actionUser: '$actionUser'
            },
            'actionCount': { '$sum': 1 }
          }
        },
        {
          '$group': {
            '_id': {
              ...secondGroup
            },
            'userCount': { '$sum': 1 },
            'actionCount': { '$sum': '$actionCount' }
          }
        }
      ]
      query.push({ $sort: sort })

      const users = await global.db.ActivityModel.aggregate(query)
      res.ok(users)
    } catch (err) {
      res.catchError(err)
    }
  }

  async getPremiumCompany (req, res) {
    let { groupBy, startDate, endDate } = req.query
    try {
      let project = { 'y': { '$year': '$createdTime' } }
      let group = { 'year': '$y' }
      let sort = { '_id.year': 1 }
      switch (groupBy) {
        case 'daily':
          project = {
            'y': { '$year': '$createdTime' },
            'm': { '$month': '$createdTime' },
            'd': { '$dayOfMonth': '$createdTime' }
          }
          group = {
            'year': '$y',
            'month': '$m',
            'day': '$d'
          }
          sort = { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
          break
        case 'monthly':
          project = {
            'y': { '$year': '$createdTime' },
            'm': { '$month': '$createdTime' }
          }
          group = {
            'year': '$y',
            'month': '$m'
          }
          sort = { '_id.year': 1, '_id.month': 1 }
          break
        case 'weekly':
          project = {
            'y': { '$year': '$createdTime' },
            'w': { '$week': '$createdTime' }
          }
          group = {
            'year': '$y',
            'week': '$w'
          }
          sort = { '_id.year': 1, '_id.week': 1 }
          break
        case 'yearly':
          project = { 'y': { '$year': '$createdTime' } }
          group = { 'year': '$y' }
          sort = { '_id.year': 1 }
          break
        default: project
      }

      if (!endDate) {
        endDate = new Date()
      }

      const users = await global.db.UserModel.aggregate([
        {
          '$match': {
            createdTime: { $gte: new Date(startDate), $lt: new Date(endDate) }
          }
        },
        { '$project': project },
        {
          '$group': {
            '_id': group,
            'count': { '$sum': 1 }
          }
        },
        { $sort: sort }
      ])
      res.ok(users)
    } catch (err) {
      res.catchError(err)
    }
  }

  async getCompanies (req, res) {
    let { planType, noGmail, noCompany, startDate,
      filterError, status,
      endDate, startDateSub, endDateSub } = req.query
    try {
      let match = {}

      if (startDate !== 'undefined' && endDate !== 'undefined') {
        match.created = {$gte: new Date(startDate), $lt: new Date(endDate)}
      }
      if (startDateSub !== 'undefined' && endDateSub !== 'undefined') {
        match['subscription.start'] = {$gte: moment(startDateSub).unix(), $lt: moment(endDateSub).unix()}
      }

      switch (planType) {
        case 'free':
          match['currentPlan.planType'] = 'Free'
          break
        case 'premium':
          match['currentPlan.planType'] = {$in: ['Scale', 'Growth', 'Enterprise']}
          break
      }
      if (noGmail) {
        match.domain = {$regex: { $ne: new RegExp('@' + '$', 'i') }}
      }
      if (noCompany) {
        match.domain = { $regex: new RegExp('@' + '$', 'i') }
      }

      switch (status) {
        case 'past_due':
          match['currentPlan.status'] = 'past_due'
          break
        case 'active':
          match['currentPlan.status'] = 'past_due'
          break
        case 'trialing':
          match['currentPlan.status'] = 'trialing'
          break
        case 'unpaid':
          match['currentPlan.status'] = 'unpaid'
          break
      }

      switch (filterError) {
        case 'withErrors':
          match['currentPlan.code'] = {$nin: ['', null, undefined]}
          break
        case 'noErrors':
          match['currentPlan.code'] = {'currentPlan.code': ''}
          break
      }

      // const users = await global.db.CompanyModel.find(query).limit(10000)
      // .populate('owner').

      const users = await this.db.CompanyModel.aggregate([
        { '$match': match },
        {
          $lookup:
          {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner'
          }

        },
        { '$project': {
          'currentPlan': 1,
          'subscription': 1,
          'created': 1,
          'domain': 1,
          'owner': { '$arrayElemAt': [ '$owner', 0 ] }
        }},
        { $limit: 2000 }

      ])
      res.ok(users)
    } catch (err) {
      res.catchError(err)
    }
  }

  async getFeedbacks (req, res) {
    let { groupBy, startDate, endDate } = req.query
    try {
      let project = { 'y': { '$year': '$createdTime' } }
      let group = { 'year': '$y' }
      let sort = { '_id.year': 1 }

      const feedbacks = await global.db.FeedbackModel.find({
        created: { $gte: new Date(startDate), $lt: new Date(endDate) }
      }).limit(10000)
      res.ok(feedbacks)
    } catch (err) {
      res.catchError(err)
    }
  }

  async getCompanyInfo (req, res) {
    const {
      domain
    } = req.query
    try {
      const users = global.db.UserModel.find({
        domain
      })
      const teams = global.db.OrganizationModel.find({
        userDomain: domain
      }).populate('members.member').populate('owner')

      const plan = global.db.CompanyModel.find({
        domain
      }).populate('currentPlan.billedTeams').populate('currentPlan.billedTeams').populate('owner')

      var promises = [users, teams, plan]
      var result = await Promise.all(promises)
      let inviteUsers = []
      result[1].map(team => {
        team.members.map(item => {
          if (item.member.domain !== domain) {
            const newObject = Object.assign({ teamName: team.name }, item.member.toJSON())
            inviteUsers.push(newObject)
          }
        })
      })
      res.ok({
        users: result[0],
        teams: result[1],
        plans: result[2],
        inviteUsers: inviteUsers
      })
    } catch (err) {
      res.catchError(err)
    }
  }

  adminLogin (req, res) {
    res.redirect(SecurityController.loginAdmin())
  }

  adminAuth (req, res) {
    SecurityController.doAuthAdmin(req.body.code, req.headers['user-agent'], config.google.adminRedirectUrl)
      .then(res.ok)
      .catch(res.catchError)
  }

  setEnterprisePlan (req, res) {
    const { domain, numberLicenses } = req.body
    this.planRepository.setEnterprisePlanFromAdmin({ domain, numberLicenses })
  }

  async changeOwnerInCompany (req, res) {
    const { domain, email } = req.body
    const user = await this.UserRepository.getUserByEmail(email)
    if (!user) {
      return res.badRequest('User by this email not found!')
    }
    if (user.generateDomain !== domain) {
      return res.badRequest('this user is not under this domain!')
    }
    this.companyRepository.changeOwnerInCompany(domain, user._id, req.user)
      .then(res.ok)
      .catch(res.catchError)
  }

  async changeOwnerInTeam (req, res) {
    const { teamId, email } = req.body
    const user = await this.UserRepository.getUserByEmail(email)
    if (!user) {
      return res.badRequest('User by this email not found!')
    }

    this.organizationRepository.changeOwnerInTeam(teamId, user._id, req.user)
      .then(res.ok)
      .catch(res.catchError)
  }

  async changeOwnerInProject (req, res) {
    const { projectId, email } = req.body
    const user = await this.UserRepository.getUserByEmail(email)
    if (!user) {
      return res.badRequest('User by this email not found!')
    }

    this.projectRepository.changeOwnerInProject(projectId, user._id, req.user)
      .then(res.ok)
      .catch(res.catchError)
  }

  async activePremiumAccountManually (req, res) {
    const { domain, numberLicenses, activeEnd, planType } = req.body

    if (!domain || numberLicenses === undefined || !activeEnd || !planType) {
      res.badRequest('Missed values!')
    }

    this.planRepository.activePremiumAccountManually({ domain, numberLicenses, activeEnd, planType })
      .then(res.ok)
      .catch(res.catchError)
  }

}

module.exports = new AdminController(new UserService(new UserRepository(), new ActivityRepository()))
