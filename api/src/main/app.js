const cors = require('cors')
const express = require('express')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')

const errorHandler = require('../interfaces/http/middlewares/errorHandler')
const criarAuthRoutes = require('../interfaces/http/routes/authRoutes')
const criarDashboardRoutes = require('../interfaces/http/routes/dashboardRoutes')
const criarOcorrenciaRoutes = require('../interfaces/http/routes/ocorrenciaRoutes')
const criarUsuarioRoutes = require('../interfaces/http/routes/usuarioRoutes')

// Recebe o container pronto: em producao vem com os repositorios Mongoose,
// nos testes de HTTP vem com dubles em memoria. A montagem do Express e a mesma.
function criarApp(container, { limiteLogin = 10 } = {}) {
  const app = express()

  // Atras do proxy do Azure Web App, o IP real chega no X-Forwarded-For.
  // Sem isto o rate limit contaria todo mundo no mesmo balde, o do proxy.
  app.set('trust proxy', 1)

  // Cabecalhos de seguranca. A politica de recurso vai de 'cross-origin' de
  // proposito: o front roda em outro dominio e precisa consumir esta API.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
  app.use(express.json())

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Forca bruta de senha e o ataque obvio contra esta API. So o login e
  // limitado: e a unica rota onde tentar de novo tem valor para o atacante.
  app.use(
    '/api/auth/login',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: limiteLogin,
      // So tentativa falha conta. Quem acerta a senha nao gasta cota, entao
      // uso legitimo nunca se tranca; quem erra em serie e exatamente o alvo.
      skipSuccessfulRequests: true,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { erro: 'Muitas tentativas de login. Tente novamente em alguns minutos' }
    })
  )

  app.use('/api/auth', criarAuthRoutes(container))
  app.use('/api/ocorrencias', criarOcorrenciaRoutes(container))
  app.use('/api/dashboard', criarDashboardRoutes(container))
  app.use('/api/usuarios', criarUsuarioRoutes(container))

  app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' })
  })

  app.use(errorHandler)

  return app
}

module.exports = criarApp
