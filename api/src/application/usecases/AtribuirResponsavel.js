const { NaoAutorizadoError, NaoEncontradoError, ValidacaoError } = require('../../domain/errors')

// Responsavel por uma ocorrencia e sempre um gestor: quem atende e quem tem
// permissao para mexer nela.
class AtribuirResponsavel {
  constructor({ ocorrenciaRepository, usuarioRepository }) {
    this.ocorrenciaRepository = ocorrenciaRepository
    this.usuarioRepository = usuarioRepository
  }

  async executar({ id, responsavelId, usuario }) {
    if (usuario.perfil !== 'gestor') {
      throw new NaoAutorizadoError('Apenas gestores atribuem responsável')
    }

    if (!responsavelId) {
      throw new ValidacaoError('responsavelId é obrigatório')
    }

    const responsavel = await this.usuarioRepository.buscarPorId(responsavelId)

    if (!responsavel) {
      throw new NaoEncontradoError('Responsável não encontrado')
    }

    if (responsavel.perfil !== 'gestor') {
      throw new ValidacaoError('O responsável precisa ter perfil gestor')
    }

    const atualizada = await this.ocorrenciaRepository.atualizar(id, { responsavel: responsavelId })

    if (!atualizada) {
      throw new NaoEncontradoError('Ocorrência não encontrada')
    }

    return atualizada
  }
}

module.exports = AtribuirResponsavel
