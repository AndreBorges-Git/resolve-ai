const { Router } = require('express')

const criarDashboardController = require('../controllers/dashboardController')
const criarAuth = require('../middlewares/auth')
const requirePerfil = require('../middlewares/requirePerfil')

function criarDashboardRoutes(container) {
  const router = Router()
  const controller = criarDashboardController(container)

  router.get('/', criarAuth(container.tokenService), requirePerfil('gestor'), controller.indicadores)

  return router
}

module.exports = criarDashboardRoutes
