const { Router } = require('express')

const criarOcorrenciaController = require('../controllers/ocorrenciaController')
const criarAuth = require('../middlewares/auth')
const requirePerfil = require('../middlewares/requirePerfil')
const imagemOpcional = require('../middlewares/upload')

function criarOcorrenciaRoutes(container) {
  const router = Router()
  const controller = criarOcorrenciaController(container)
  const auth = criarAuth(container.tokenService)

  router.use(auth)

  router.post('/', imagemOpcional('imagem'), controller.registrar)
  router.get('/', controller.listar)
  router.get('/:id', controller.obter)

  // Mudanca de status e coisa de gestor; o 403 nasce aqui, antes do caso de uso.
  router.patch('/:id/status', requirePerfil('gestor'), controller.alterarStatus)

  router.get('/:id/historico', controller.historico)
  router.post('/:id/comentarios', controller.comentar)
  router.get('/:id/comentarios', controller.comentarios)

  return router
}

module.exports = criarOcorrenciaRoutes
