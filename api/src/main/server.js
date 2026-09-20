require('dotenv').config()

const { conectar } = require('../infrastructure/config/db')
const criarApp = require('./app')
const criarContainer = require('./container')

const PORT = process.env.PORT || 3000

async function iniciar() {
  try {
    await conectar(process.env.MONGODB_URI)
    console.log('MongoDB conectado')

    const app = criarApp(criarContainer())

    app.listen(PORT, () => {
      console.log(`API ouvindo na porta ${PORT}`)
    })
  } catch (erro) {
    console.error('Falha ao subir a API:', erro.message)
    process.exit(1)
  }
}

iniciar()
