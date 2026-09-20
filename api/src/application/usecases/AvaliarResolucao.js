const Ocorrencia = require('../../domain/entities/Ocorrencia')
const {
  NaoAutorizadoError,
  NaoEncontradoError,
  TransicaoInvalidaError,
  ValidacaoError
} = require('../../domain/errors')

const COMENTARIO_MAXIMO = 500

// Avaliar so faz sentido depois de resolvida, e so o dono avalia.
// Fora disso e 409, nao 400: o pedido e valido, o momento e que nao e.
class AvaliarResolucao {
  constructor({ ocorrenciaRepository }) {
    this.ocorrenciaRepository = ocorrenciaRepository
  }

  async executar({ id, nota, comentario = null, usuario }) {
    const valor = Number(nota)

    if (!Number.isInteger(valor) || valor < 1 || valor > 5) {
      throw new ValidacaoError('nota deve ser um inteiro de 1 a 5')
    }

    if (comentario && String(comentario).length > COMENTARIO_MAXIMO) {
      throw new ValidacaoError(`comentario deve ter no maximo ${COMENTARIO_MAXIMO} caracteres`)
    }

    const registro = await this.ocorrenciaRepository.buscarPorId(id)

    if (!registro) {
      throw new NaoEncontradoError('Ocorrência não encontrada')
    }

    const ocorrencia = new Ocorrencia(registro)

    if (!ocorrencia.pertenceA(usuario.id)) {
      throw new NaoAutorizadoError('Apenas o solicitante que abriu a ocorrência pode avaliar')
    }

    if (ocorrencia.status !== 'resolvida') {
      throw new TransicaoInvalidaError(
        `So e possivel avaliar uma ocorrencia resolvida. Status atual: '${ocorrencia.status}'`
      )
    }

    if (ocorrencia.avaliacao) {
      throw new TransicaoInvalidaError('Esta ocorrência já foi avaliada')
    }

    return this.ocorrenciaRepository.atualizar(id, {
      avaliacao: {
        nota: valor,
        comentario: comentario ? String(comentario).trim() : null,
        data: new Date()
      }
    })
  }
}

module.exports = AvaliarResolucao
