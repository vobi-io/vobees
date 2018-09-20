var security = require('../security/securityController')
var ctrlUser = require('./userController')

module.exports = {
  '/api/v1/users': {
    '/logger': {
      post: [security.setUserIfExist.bind(security), ctrlUser.logger.bind(ctrlUser)]
    },
    '/ip': {
      get: [ctrlUser.getIp.bind(ctrlUser)]
    },
    '/tour': {
      put: [security.isAuthenticated.bind(security), ctrlUser.editTour.bind(ctrlUser)]
    },
    '/gantt-tour': {
      put: [security.isAuthenticated.bind(security), ctrlUser.editGanttTour.bind(ctrlUser)]
    },
    '/check-offline-access': {
      post: [security.isAuthenticated.bind(security),
        security.checkOfflineAccess.bind(security), security.isOfflineAccess.bind(security)]
    },
    '/set-test-mode': {
      post: [security.isAuthenticated.bind(security), security.setTestMode.bind(security)]
    },
    '/offline-access-code': {
      post: [security.isAuthenticated.bind(security), security.offlineAccessCode.bind(security)]
    },
    '/language': {
      put: [security.isAuthenticated.bind(security), ctrlUser.editLanguage.bind(ctrlUser)]
    },
    '/account': {
      delete: [security.isAuthenticated.bind(security), ctrlUser.deleteAccount.bind(ctrlUser)],
      '/disable': {
        put: [security.isAuthenticated.bind(security), ctrlUser.disableAccount.bind(ctrlUser)]
      }
    },
    '/notifications': {
      put: [security.isAuthenticated.bind(security), ctrlUser.updateNotifications.bind(ctrlUser)]
    },
    '/info': {
      get: [security.isAuthenticated.bind(security), ctrlUser.getUserById.bind(ctrlUser)]
    },
    '/send-email': {
      post: [security.isAuthenticated.bind(security), ctrlUser.sendEmailToUser.bind(ctrlUser)]
    }
  }
}
