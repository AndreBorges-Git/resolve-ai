const ComentarioRepository = require('../../src/application/ports/ComentarioRepository')

let sequencia = 0

class ComentarioRepositoryFake extends ComentarioRepository {
  constructor() {
    super()
    this.itens = []
  }

  async salvar({ ocorrencia, autor, texto }) {
    sequencia += 1

    const registro = {
      id: `comentario-${sequencia}`,
      ocorrencia,
      autor: { id: String(autor) },
      texto,
      data: new Date()
    }

    this.itens.push(registro)

    return { ...registro }
  }

  async listarPorOcorrencia(ocorrenciaId) {
    return this.itens
      .filter((item) => item.ocorrencia === ocorrenciaId)
      .map((item) => ({ ...item }))
  }
}

module.exports = ComentarioRepositoryFake
