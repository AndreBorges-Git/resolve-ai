class OcorrenciaRepository {
  async salvar(ocorrencia) {
    throw new Error('nao implementado')
  }

  async atualizar(id, campos) {
    throw new Error('nao implementado')
  }

  async buscarPorId(id) {
    throw new Error('nao implementado')
  }

  // Devolve { itens, total, page, limit }.
  async listar(filtros, paginacao) {
    throw new Error('nao implementado')
  }

  async remover(id) {
    throw new Error('nao implementado')
  }

  async indicadores() {
    throw new Error('nao implementado')
  }
}

module.exports = OcorrenciaRepository
