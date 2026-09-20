const { NaoAutorizadoError, NaoEncontradoError, ValidacaoError } = require('../../domain/errors')

const TAMANHO_MAXIMO = 2000

// Registrar a solucao nao move o status: quem move e AlterarStatusOcorrencia,
// que e quem grava a trilha. Uma responsabilidade por caso de uso.
class RegistrarSolucao {
  constructor({ ocorrenciaRepository }) {
    this.ocorrenciaRepository = ocorrenciaRepository
  }

  async executar({ id, solucaoAplicada, usuario }) {
    if (usuario.perfil !== 'gestor') {
      throw new NaoAutorizadoError('Apenas gestores registram a solucao')
    }

    const texto = typeof solucaoAplicada === 'string' ? solucaoAplicada.trim() : ''

    if (!texto) {
      throw new ValidacaoError('solucaoAplicada e obrigatoria')
    }

    if (texto.length > TAMANHO_MAXIMO) {
      throw new ValidacaoError(`solucaoAplicada deve ter no maximo ${TAMANHO_MAXIMO} caracteres`)
    }

    const atualizada = await this.ocorrenciaRepository.atualizar(id, { solucaoAplicada: texto })

    if (!atualizada) {
      throw new NaoEncontradoError('Ocorrencia nao encontrada')
    }

    return atualizada
  }
}

module.exports = RegistrarSolucao
