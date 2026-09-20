const cors = require('cors')
const express = require('express')

const errorHandler = require('../interfaces/http/middlewares/errorHandler')

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota nao encontrada' })
})

app.use(errorHandler)

module.exports = app
