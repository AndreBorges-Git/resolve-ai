class OcorrenciaRepository {
  async salvar(ocorrencia) {
    throw new Error('não implementado')
  }

  async atualizar(id, campos) {
    throw new Error('não implementado')
  }

  async buscarPorId(id) {
    throw new Error('não implementado')
  }

  // Devolve { itens, total, page, limit }.
  async listar(filtros, paginacao) {
    throw new Error('não implementado')
  }

  async remover(id) {
    throw new Error('não implementado')
  }

  async indicadores() {
    throw new Error('não implementado')
  }
}

module.exports = OcorrenciaRepository
