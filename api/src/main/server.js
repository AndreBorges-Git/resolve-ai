require('dotenv').config()

const app = require('./app')
const { conectar } = require('../infrastructure/config/db')

const PORT = process.env.PORT || 3000

async function iniciar() {
  try {
    await conectar(process.env.MONGODB_URI)
    console.log('MongoDB conectado')

    app.listen(PORT, () => {
      console.log(`API ouvindo na porta ${PORT}`)
    })
  } catch (erro) {
    console.error('Falha ao subir a API:', erro.message)
    process.exit(1)
  }
}

iniciar()
