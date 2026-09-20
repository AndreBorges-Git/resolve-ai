const HistoricoRepository = require('../../src/application/ports/HistoricoRepository')

let sequencia = 0

class HistoricoRepositoryFake extends HistoricoRepository {
  constructor() {
    super()
    this.itens = []
  }

  async registrar(entrada) {
    sequencia += 1

    const registro = {
      id: `historico-${sequencia}`,
      statusAnterior: entrada.statusAnterior ?? null,
      observacao: entrada.observacao ?? null,
      data: entrada.data || new Date(),
      ...entrada,
      usuario: { id: String(entrada.usuario) }
    }

    this.itens.push(registro)

    return { ...registro }
  }

  async listarPorOcorrencia(ocorrenciaId) {
    return this.itens
      .filter((item) => item.ocorrencia === ocorrenciaId)
      .map((item) => ({ ...item }))
  }

  async removerPorOcorrencia(ocorrenciaId) {
    this.itens = this.itens.filter((item) => item.ocorrencia !== ocorrenciaId)
  }
}

module.exports = HistoricoRepositoryFake
