const cors = require('cors')
const express = require('express')

const errorHandler = require('../interfaces/http/middlewares/errorHandler')
const criarAuthRoutes = require('../interfaces/http/routes/authRoutes')
const criarDashboardRoutes = require('../interfaces/http/routes/dashboardRoutes')
const criarOcorrenciaRoutes = require('../interfaces/http/routes/ocorrenciaRoutes')
const criarUsuarioRoutes = require('../interfaces/http/routes/usuarioRoutes')

// Recebe o container pronto: em producao vem com os repositorios Mongoose,
// nos testes de HTTP vem com dubles em memoria. A montagem do Express e a mesma.
function criarApp(container) {
  const app = express()

  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
  app.use(express.json())

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use('/api/auth', criarAuthRoutes(container))
  app.use('/api/ocorrencias', criarOcorrenciaRoutes(container))
  app.use('/api/dashboard', criarDashboardRoutes(container))
  app.use('/api/usuarios', criarUsuarioRoutes(container))

  app.use((req, res) => {
    res.status(404).json({ erro: 'Rota nao encontrada' })
  })

  app.use(errorHandler)

  return app
}

module.exports = criarApp
