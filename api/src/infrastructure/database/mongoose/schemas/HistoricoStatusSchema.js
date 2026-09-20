const mongoose = require('mongoose')

// Colecao propria: a trilha de auditoria e consultada e preservada isoladamente.
const HistoricoStatusSchema = new mongoose.Schema({
  ocorrencia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ocorrencia',
    required: true,
    index: true
  },
  statusAnterior: { type: String, default: null },
  statusNovo: { type: String, required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  observacao: { type: String, default: null },
  data: { type: Date, default: Date.now }
})

module.exports = mongoose.model('HistoricoStatus', HistoricoStatusSchema)
