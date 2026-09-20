const mongoose = require('mongoose')

const Ocorrencia = require('../../../../domain/entities/Ocorrencia')

const AvaliacaoSchema = new mongoose.Schema(
  {
    nota: { type: Number, min: 1, max: 5, required: true },
    comentario: { type: String, trim: true },
    data: { type: Date, default: Date.now }
  },
  { _id: false }
)

const OcorrenciaSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descricao: { type: String, required: true, trim: true },
    categoria: { type: String, enum: Ocorrencia.CATEGORIAS, required: true },
    localizacao: { type: String, required: true, trim: true },
    imagemUrl: { type: String, default: null },
    prioridade: { type: String, enum: Ocorrencia.PRIORIDADES, default: 'media' },
    status: { type: String, enum: Ocorrencia.STATUS, default: 'aberta', index: true },
    solicitante: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },
    responsavel: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
    solucaoAplicada: { type: String, default: null },
    avaliacao: { type: AvaliacaoSchema, default: null },
    resolvidaEm: { type: Date, default: null }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Ocorrencia', OcorrenciaSchema)
