const mongoose = require('mongoose')

const OcorrenciaRepository = require('../../../../application/ports/OcorrenciaRepository')
const OcorrenciaModel = require('../schemas/OcorrenciaSchema')

const CAMPOS_USUARIO = 'nome email perfil'

function usuarioParaObjeto(valor) {
  if (!valor) {
    return null
  }

  if (valor._id) {
    return {
      id: valor._id.toString(),
      nome: valor.nome,
      email: valor.email,
      perfil: valor.perfil
    }
  }

  return { id: valor.toString() }
}

function paraObjeto(documento) {
  if (!documento) {
    return null
  }

  return {
    id: documento._id.toString(),
    titulo: documento.titulo,
    descricao: documento.descricao,
    categoria: documento.categoria,
    localizacao: documento.localizacao,
    imagemUrl: documento.imagemUrl,
    prioridade: documento.prioridade,
    status: documento.status,
    solicitante: usuarioParaObjeto(documento.solicitante),
    responsavel: usuarioParaObjeto(documento.responsavel),
    solucaoAplicada: documento.solucaoAplicada,
    avaliacao: documento.avaliacao
      ? {
          nota: documento.avaliacao.nota,
          comentario: documento.avaliacao.comentario,
          data: documento.avaliacao.data
        }
      : null,
    resolvidaEm: documento.resolvidaEm,
    createdAt: documento.createdAt,
    updatedAt: documento.updatedAt
  }
}

class OcorrenciaRepositoryMongoose extends OcorrenciaRepository {
  async salvar(ocorrencia) {
    const documento = await OcorrenciaModel.create({
      titulo: ocorrencia.titulo,
      descricao: ocorrencia.descricao,
      categoria: ocorrencia.categoria,
      localizacao: ocorrencia.localizacao,
      imagemUrl: ocorrencia.imagemUrl,
      prioridade: ocorrencia.prioridade,
      status: ocorrencia.status,
      solicitante: ocorrencia.solicitanteId,
      responsavel: ocorrencia.responsavel,
      solucaoAplicada: ocorrencia.solucaoAplicada,
      avaliacao: ocorrencia.avaliacao,
      resolvidaEm: ocorrencia.resolvidaEm
    })

    await documento.populate('solicitante', CAMPOS_USUARIO)

    return paraObjeto(documento)
  }

  async atualizar(id, campos) {
    const documento = await OcorrenciaModel.findByIdAndUpdate(id, campos, { new: true })
      .populate('solicitante', CAMPOS_USUARIO)
      .populate('responsavel', CAMPOS_USUARIO)

    return paraObjeto(documento)
  }

  async buscarPorId(id) {
    if (!mongoose.isValidObjectId(id)) {
      // Id fora do formato do Mongo nao e erro de servidor: nao existe.
      return null
    }

    const documento = await OcorrenciaModel.findById(id)
      .populate('solicitante', CAMPOS_USUARIO)
      .populate('responsavel', CAMPOS_USUARIO)

    return paraObjeto(documento)
  }

  async listar({ solicitante, categoria, status, prioridade } = {}, { page = 1, limit = 10 } = {}) {
    const filtro = {}

    if (solicitante) filtro.solicitante = solicitante
    if (categoria) filtro.categoria = categoria
    if (status) filtro.status = status
    if (prioridade) filtro.prioridade = prioridade

    const pular = (page - 1) * limit

    const [documentos, total] = await Promise.all([
      OcorrenciaModel.find(filtro)
        .sort({ createdAt: -1 })
        .skip(pular)
        .limit(limit)
        .populate('solicitante', CAMPOS_USUARIO)
        .populate('responsavel', CAMPOS_USUARIO),
      OcorrenciaModel.countDocuments(filtro)
    ])

    return {
      itens: documentos.map(paraObjeto),
      total,
      page,
      limit,
      paginas: Math.max(1, Math.ceil(total / limit))
    }
  }

  async remover(id) {
    await OcorrenciaModel.findByIdAndDelete(id)
  }
}

module.exports = OcorrenciaRepositoryMongoose
