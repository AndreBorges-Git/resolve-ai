const Ocorrencia = require('../../domain/entities/Ocorrencia')
const { NaoAutorizadoError, NaoEncontradoError } = require('../../domain/errors')

class ListarComentarios {
  constructor({ ocorrenciaRepository, comentarioRepository }) {
    this.ocorrenciaRepository = ocorrenciaRepository
    this.comentarioRepository = comentarioRepository
  }

  async executar({ id, usuario }) {
    const registro = await this.ocorrenciaRepository.buscarPorId(id)

    if (!registro) {
      throw new NaoEncontradoError('Ocorrencia nao encontrada')
    }

    if (!new Ocorrencia(registro).podeSerVistaPor(usuario)) {
      throw new NaoAutorizadoError('Esta ocorrencia pertence a outro solicitante')
    }

    return this.comentarioRepository.listarPorOcorrencia(id)
  }
}

module.exports = ListarComentarios
