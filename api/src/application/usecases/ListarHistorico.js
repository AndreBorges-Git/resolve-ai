const Ocorrencia = require('../../domain/entities/Ocorrencia')
const { NaoAutorizadoError, NaoEncontradoError } = require('../../domain/errors')

// A trilha de auditoria em rota propria: e ela que alimenta a timeline do front.
class ListarHistorico {
  constructor({ ocorrenciaRepository, historicoRepository }) {
    this.ocorrenciaRepository = ocorrenciaRepository
    this.historicoRepository = historicoRepository
  }

  async executar({ id, usuario }) {
    const registro = await this.ocorrenciaRepository.buscarPorId(id)

    if (!registro) {
      throw new NaoEncontradoError('Ocorrencia nao encontrada')
    }

    if (!new Ocorrencia(registro).podeSerVistaPor(usuario)) {
      throw new NaoAutorizadoError('Esta ocorrencia pertence a outro solicitante')
    }

    return this.historicoRepository.listarPorOcorrencia(id)
  }
}

module.exports = ListarHistorico
