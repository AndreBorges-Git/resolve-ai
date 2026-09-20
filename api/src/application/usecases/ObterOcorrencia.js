const Ocorrencia = require('../../domain/entities/Ocorrencia')
const { NaoAutorizadoError, NaoEncontradoError } = require('../../domain/errors')

// Detalhe = ocorrencia + comentarios + trilha de auditoria, em uma resposta so.
class ObterOcorrencia {
  constructor({ ocorrenciaRepository, comentarioRepository, historicoRepository }) {
    this.ocorrenciaRepository = ocorrenciaRepository
    this.comentarioRepository = comentarioRepository
    this.historicoRepository = historicoRepository
  }

  async executar({ id, usuario }) {
    const ocorrencia = await this.ocorrenciaRepository.buscarPorId(id)

    if (!ocorrencia) {
      throw new NaoEncontradoError('Ocorrência não encontrada')
    }

    if (!new Ocorrencia(ocorrencia).podeSerVistaPor(usuario)) {
      throw new NaoAutorizadoError('Esta ocorrência pertence a outro solicitante')
    }

    const [comentarios, historico] = await Promise.all([
      this.comentarioRepository.listarPorOcorrencia(id),
      this.historicoRepository.listarPorOcorrencia(id)
    ])

    return { ...ocorrencia, comentarios, historico }
  }
}

module.exports = ObterOcorrencia
