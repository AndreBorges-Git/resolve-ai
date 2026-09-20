const mongoose = require('mongoose')

const UsuarioSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senha: { type: String, required: true, select: false },
    perfil: {
      type: String,
      enum: ['solicitante', 'gestor'],
      default: 'solicitante'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Usuario', UsuarioSchema)
