const Ocorrencia = require('../../domain/entities/Ocorrencia')
const { NaoAutorizadoError, NaoEncontradoError } = require('../../domain/errors')

// Coracao da auditoria: valida a transicao pelo dominio, persiste o novo status
// e grava o HistoricoStatus na mesma operacao. Nunca em rota separada.
class AlterarStatusOcorrencia {
  constructor({ ocorrenciaRepository, historicoRepository }) {
    this.ocorrenciaRepository = ocorrenciaRepository
    this.historicoRepository = historicoRepository
  }

  async executar({ id, status, observacao = null, usuario }) {
    if (usuario.perfil !== 'gestor') {
      throw new NaoAutorizadoError('Apenas gestores alteram o status de uma ocorrencia')
    }

    const registro = await this.ocorrenciaRepository.buscarPorId(id)

    if (!registro) {
      throw new NaoEncontradoError('Ocorrencia nao encontrada')
    }

    const ocorrencia = new Ocorrencia(registro)

    // A regra e da entidade: aqui so pedimos. Transicao invalida sobe como
    // TransicaoInvalidaError e o errorHandler traduz em 409.
    const statusAnterior = ocorrencia.alterarStatus(status)

    const atualizada = await this.ocorrenciaRepository.atualizar(id, {
      status: ocorrencia.status,
      resolvidaEm: ocorrencia.resolvidaEm
    })

    try {
      await this.historicoRepository.registrar({
        ocorrencia: id,
        statusAnterior,
        statusNovo: ocorrencia.status,
        usuario: usuario.id,
        observacao
      })
    } catch (erro) {
      // Mudanca de status sem trilha nao pode ficar de pe: volta o status.
      await this.ocorrenciaRepository.atualizar(id, {
        status: statusAnterior,
        resolvidaEm: registro.resolvidaEm ?? null
      })

      throw erro
    }

    return atualizada
  }
}

module.exports = AlterarStatusOcorrencia
