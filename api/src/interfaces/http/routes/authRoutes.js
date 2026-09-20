const { Router } = require('express')

const criarAuthController = require('../controllers/authController')
const criarAuth = require('../middlewares/auth')

function criarAuthRoutes(container) {
  const router = Router()
  const controller = criarAuthController(container)
  const auth = criarAuth(container.tokenService)

  router.post('/registrar', controller.registrar)
  router.post('/login', controller.login)
  router.get('/eu', auth, controller.eu)

  return router
}

module.exports = criarAuthRoutes
