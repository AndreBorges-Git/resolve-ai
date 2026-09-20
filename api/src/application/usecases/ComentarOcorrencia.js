const Ocorrencia = require('../../domain/entities/Ocorrencia')
const { NaoAutorizadoError, NaoEncontradoError, ValidacaoError } = require('../../domain/errors')

const TAMANHO_MAXIMO = 1000

// Dono ou gestor comentam. Quem nao enxerga a ocorrencia nao comenta nela.
class ComentarOcorrencia {
  constructor({ ocorrenciaRepository, comentarioRepository }) {
    this.ocorrenciaRepository = ocorrenciaRepository
    this.comentarioRepository = comentarioRepository
  }

  async executar({ id, texto, usuario }) {
    const conteudo = typeof texto === 'string' ? texto.trim() : ''

    if (!conteudo) {
      throw new ValidacaoError('texto do comentário é obrigatório')
    }

    if (conteudo.length > TAMANHO_MAXIMO) {
      throw new ValidacaoError(`texto do comentario deve ter no maximo ${TAMANHO_MAXIMO} caracteres`)
    }

    const registro = await this.ocorrenciaRepository.buscarPorId(id)

    if (!registro) {
      throw new NaoEncontradoError('Ocorrência não encontrada')
    }

    if (!new Ocorrencia(registro).podeSerVistaPor(usuario)) {
      throw new NaoAutorizadoError('Esta ocorrência pertence a outro solicitante')
    }

    return this.comentarioRepository.salvar({ ocorrencia: id, autor: usuario.id, texto: conteudo })
  }
}

module.exports = ComentarOcorrencia
