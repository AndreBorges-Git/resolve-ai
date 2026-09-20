const Ocorrencia = require('../../domain/entities/Ocorrencia')
const { NaoAutorizadoError } = require('../../domain/errors')

// Completa com zero o que a agregacao nao devolveu: o dashboard precisa das
// cinco barras sempre, mesmo que nenhuma ocorrencia esteja naquele status.
function comTodasAsChaves(contagem = {}, chaves) {
  return chaves.reduce((acumulado, chave) => ({ ...acumulado, [chave]: contagem[chave] || 0 }), {})
}

class ObterIndicadores {
  constructor({ ocorrenciaRepository }) {
    this.ocorrenciaRepository = ocorrenciaRepository
  }

  async executar({ usuario }) {
    if (usuario.perfil !== 'gestor') {
      throw new NaoAutorizadoError('Apenas gestores acessam o dashboard')
    }

    const bruto = await this.ocorrenciaRepository.indicadores()

    return {
      total: bruto.total || 0,
      porStatus: comTodasAsChaves(bruto.porStatus, Ocorrencia.STATUS),
      porCategoria: comTodasAsChaves(bruto.porCategoria, Ocorrencia.CATEGORIAS),
      porPrioridade: comTodasAsChaves(bruto.porPrioridade, Ocorrencia.PRIORIDADES),
      tempoMedioResolucaoHoras:
        bruto.tempoMedioResolucaoHoras === null || bruto.tempoMedioResolucaoHoras === undefined
          ? null
          : Number(bruto.tempoMedioResolucaoHoras.toFixed(1)),
      avaliacaoMedia:
        bruto.avaliacaoMedia === null || bruto.avaliacaoMedia === undefined
          ? null
          : Number(bruto.avaliacaoMedia.toFixed(2))
    }
  }
}

module.exports = ObterIndicadores
