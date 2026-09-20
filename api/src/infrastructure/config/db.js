const mongoose = require('mongoose')

async function conectar(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI não configurada')
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)

  return mongoose.connection
}

async function desconectar() {
  await mongoose.disconnect()
}

module.exports = { conectar, desconectar }
