var security = require('../security/securityController')
var ctrlAdmin = require('./adminController')

module.exports = {
  '/api/v1/admin': {
    '/user-info': {
      get: [security.isAuthenticated.bind(security),
        security.isAdmin.bind(security),
        ctrlAdmin.getUserInfo.bind(ctrlAdmin)]
    },
    '/domain-info': {
      get: [security.isAuthenticated.bind(security),
        security.isAdmin.bind(security),
        ctrlAdmin.getCompanyInfo.bind(ctrlAdmin)]
    },
    '/users-count': {
      get: [
        security.isAuthenticated.bind(security),
        security.isAdmin.bind(security),
        ctrlAdmin.getUsersCount.bind(ctrlAdmin)]
    },
    '/users-unique-number': {
      get: [
        security.isAuthenticated.bind(security),
        security.isAdmin.bind(security),
        ctrlAdmin.getUniqueUsers.bind(ctrlAdmin)]
    },
    '/company': {
      get: [security.isAuthenticated.bind(security),
        security.isAdmin.bind(security),
        ctrlAdmin.getPremiumCompany.bind(ctrlAdmin)],
      '/list': {
        get: [security.isAuthenticated.bind(security),
          security.isAdmin.bind(security),
          ctrlAdmin.getCompanies.bind(ctrlAdmin)]
      }
    },
    '/plan': {
      '/set-enterprise': {
        post: [security.isAuthenticated.bind(security),
          security.isAdmin.bind(security),
          ctrlAdmin.setEnterprisePlan.bind(ctrlAdmin)]
      }
    },
    '/change-company-owner': {
      post: [security.isAuthenticated.bind(security),
        security.isAdmin.bind(security),
        ctrlAdmin.changeOwnerInCompany.bind(ctrlAdmin)]
    },
    '/change-team-owner': {
      post: [security.isAuthenticated.bind(security),
        security.isAdmin.bind(security),
        ctrlAdmin.changeOwnerInTeam.bind(ctrlAdmin)]
    },
    '/change-project-owner': {
      post: [security.isAuthenticated.bind(security),
        security.isAdmin.bind(security),
        ctrlAdmin.changeOwnerInProject.bind(ctrlAdmin)]
    },
    '/active-premium-account': {
      post: [security.isAuthenticated.bind(security),
        security.isAdmin.bind(security),
        ctrlAdmin.activePremiumAccountManually.bind(ctrlAdmin)]
    },
    '/login': {
      get: [ctrlAdmin.adminLogin.bind(ctrlAdmin)]
    },
    '/auth': {
      post: [ctrlAdmin.adminAuth.bind(ctrlAdmin)]
    },
    '/feedbacks': {
      get: [security.isAuthenticated.bind(security),
        security.isAdmin.bind(security),
        ctrlAdmin.getFeedbacks.bind(ctrlAdmin)]
    }
  }
}
