const { Router } = require('express')

const criarUsuarioController = require('../controllers/usuarioController')
const criarAuth = require('../middlewares/auth')
const requirePerfil = require('../middlewares/requirePerfil')

function criarUsuarioRoutes(container) {
  const router = Router()
  const controller = criarUsuarioController(container)

  router.get('/', criarAuth(container.tokenService), requirePerfil('gestor'), controller.listar)

  return router
}

module.exports = criarUsuarioRoutes
