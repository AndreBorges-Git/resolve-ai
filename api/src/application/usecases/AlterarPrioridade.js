const Ocorrencia = require('../../domain/entities/Ocorrencia')
const { NaoAutorizadoError, NaoEncontradoError, ValidacaoError } = require('../../domain/errors')

class AlterarPrioridade {
  constructor({ ocorrenciaRepository }) {
    this.ocorrenciaRepository = ocorrenciaRepository
  }

  async executar({ id, prioridade, usuario }) {
    if (usuario.perfil !== 'gestor') {
      throw new NaoAutorizadoError('Apenas gestores alteram a prioridade')
    }

    if (!Ocorrencia.PRIORIDADES.includes(prioridade)) {
      throw new ValidacaoError(`prioridade invalida. Use: ${Ocorrencia.PRIORIDADES.join(', ')}`)
    }

    const atualizada = await this.ocorrenciaRepository.atualizar(id, { prioridade })

    if (!atualizada) {
      throw new NaoEncontradoError('Ocorrência não encontrada')
    }

    return atualizada
  }
}

module.exports = AlterarPrioridade
