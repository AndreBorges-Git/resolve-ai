const HistoricoRepository = require('../../../../application/ports/HistoricoRepository')
const HistoricoStatusModel = require('../schemas/HistoricoStatusSchema')

function paraObjeto(documento) {
  if (!documento) {
    return null
  }

  const usuario = documento.usuario

  return {
    id: documento._id.toString(),
    ocorrencia: documento.ocorrencia.toString(),
    statusAnterior: documento.statusAnterior,
    statusNovo: documento.statusNovo,
    usuario:
      usuario && usuario._id
        ? { id: usuario._id.toString(), nome: usuario.nome, perfil: usuario.perfil }
        : { id: String(usuario) },
    observacao: documento.observacao,
    data: documento.data
  }
}

class HistoricoRepositoryMongoose extends HistoricoRepository {
  async registrar({ ocorrencia, statusAnterior, statusNovo, usuario, observacao, data }) {
    const documento = await HistoricoStatusModel.create({
      ocorrencia,
      statusAnterior: statusAnterior || null,
      statusNovo,
      usuario,
      observacao: observacao || null,
      data: data || new Date()
    })

    return paraObjeto(documento)
  }

  async listarPorOcorrencia(ocorrenciaId) {
    const documentos = await HistoricoStatusModel.find({ ocorrencia: ocorrenciaId })
      .sort({ data: 1 })
      .populate('usuario', 'nome perfil')

    return documentos.map(paraObjeto)
  }

  async removerPorOcorrencia(ocorrenciaId) {
    await HistoricoStatusModel.deleteMany({ ocorrencia: ocorrenciaId })
  }
}

module.exports = HistoricoRepositoryMongoose
