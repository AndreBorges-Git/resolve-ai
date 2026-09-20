const { Router } = require('express')

const criarOcorrenciaController = require('../controllers/ocorrenciaController')
const criarAuth = require('../middlewares/auth')
const imagemOpcional = require('../middlewares/upload')

function criarOcorrenciaRoutes(container) {
  const router = Router()
  const controller = criarOcorrenciaController(container)
  const auth = criarAuth(container.tokenService)

  router.use(auth)

  router.post('/', imagemOpcional('imagem'), controller.registrar)
  router.get('/', controller.listar)
  router.get('/:id', controller.obter)

  return router
}

module.exports = criarOcorrenciaRoutes
