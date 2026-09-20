const OcorrenciaRepository = require('../../src/application/ports/OcorrenciaRepository')

let sequencia = 0

class OcorrenciaRepositoryFake extends OcorrenciaRepository {
  constructor() {
    super()
    this.itens = []
  }

  async salvar(ocorrencia) {
    sequencia += 1

    const registro = {
      id: `ocorrencia-${sequencia}`,
      titulo: ocorrencia.titulo,
      descricao: ocorrencia.descricao,
      categoria: ocorrencia.categoria,
      localizacao: ocorrencia.localizacao,
      imagemUrl: ocorrencia.imagemUrl,
      prioridade: ocorrencia.prioridade,
      status: ocorrencia.status,
      solicitante: { id: String(ocorrencia.solicitanteId) },
      responsavel: ocorrencia.responsavel || null,
      solucaoAplicada: ocorrencia.solucaoAplicada || null,
      avaliacao: ocorrencia.avaliacao || null,
      resolvidaEm: ocorrencia.resolvidaEm || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.itens.push(registro)

    return { ...registro }
  }

  async atualizar(id, campos) {
    const registro = this.itens.find((item) => item.id === id)

    if (!registro) {
      return null
    }

    Object.assign(registro, campos, { updatedAt: new Date() })

    return { ...registro }
  }

  async buscarPorId(id) {
    const registro = this.itens.find((item) => item.id === id)

    return registro ? { ...registro } : null
  }

  async listar({ solicitante, categoria, status, prioridade } = {}, { page = 1, limit = 10 } = {}) {
    const filtrados = this.itens.filter((item) => {
      if (solicitante && item.solicitante.id !== String(solicitante)) return false
      if (categoria && item.categoria !== categoria) return false
      if (status && item.status !== status) return false
      if (prioridade && item.prioridade !== prioridade) return false

      return true
    })

    const inicio = (page - 1) * limit

    return {
      itens: filtrados.slice(inicio, inicio + limit).map((item) => ({ ...item })),
      total: filtrados.length,
      page,
      limit,
      paginas: Math.max(1, Math.ceil(filtrados.length / limit))
    }
  }

  async remover(id) {
    this.itens = this.itens.filter((item) => item.id !== id)
  }

  async indicadores() {
    const contar = (campo) =>
      this.itens.reduce(
        (acumulado, item) => ({ ...acumulado, [item[campo]]: (acumulado[item[campo]] || 0) + 1 }),
        {}
      )

    const resolvidas = this.itens.filter((item) => item.resolvidaEm)
    const avaliadas = this.itens.filter((item) => item.avaliacao && item.avaliacao.nota)
    const media = (lista, valor) =>
      lista.length ? lista.reduce((soma, item) => soma + valor(item), 0) / lista.length : null

    return {
      total: this.itens.length,
      porStatus: contar('status'),
      porCategoria: contar('categoria'),
      porPrioridade: contar('prioridade'),
      tempoMedioResolucaoHoras: media(
        resolvidas,
        (item) => (item.resolvidaEm - item.createdAt) / (1000 * 60 * 60)
      ),
      avaliacaoMedia: media(avaliadas, (item) => item.avaliacao.nota)
    }
  }
}

module.exports = OcorrenciaRepositoryFake
