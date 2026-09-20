const ComentarioRepository = require('../../../../application/ports/ComentarioRepository')
const ComentarioModel = require('../schemas/ComentarioSchema')

function paraObjeto(documento) {
  if (!documento) {
    return null
  }

  const autor = documento.autor

  return {
    id: documento._id.toString(),
    ocorrencia: documento.ocorrencia.toString(),
    autor:
      autor && autor._id
        ? { id: autor._id.toString(), nome: autor.nome, perfil: autor.perfil }
        : { id: String(autor) },
    texto: documento.texto,
    data: documento.data
  }
}

class ComentarioRepositoryMongoose extends ComentarioRepository {
  async salvar({ ocorrencia, autor, texto }) {
    const documento = await ComentarioModel.create({ ocorrencia, autor, texto })
    await documento.populate('autor', 'nome perfil')

    return paraObjeto(documento)
  }

  async listarPorOcorrencia(ocorrenciaId) {
    const documentos = await ComentarioModel.find({ ocorrencia: ocorrenciaId })
      .sort({ data: 1 })
      .populate('autor', 'nome perfil')

    return documentos.map(paraObjeto)
  }
}

module.exports = ComentarioRepositoryMongoose
