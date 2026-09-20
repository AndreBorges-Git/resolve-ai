const mongoose = require('mongoose')

const ComentarioSchema = new mongoose.Schema({
  ocorrencia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ocorrencia',
    required: true,
    index: true
  },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  texto: { type: String, required: true, trim: true },
  data: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Comentario', ComentarioSchema)
