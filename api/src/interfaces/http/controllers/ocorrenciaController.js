// Controller burro: le o HTTP, chama o caso de uso, devolve o status.
// Nenhuma regra de negocio mora aqui.
function criarOcorrenciaController({ registrarOcorrencia, listarOcorrencias, obterOcorrencia }) {
  return {
    async registrar(req, res, next) {
      try {
        const ocorrencia = await registrarOcorrencia.executar({
          dados: req.body,
          arquivo: req.file || null,
          usuario: req.usuario
        })

        res.status(201).json(ocorrencia)
      } catch (erro) {
        next(erro)
      }
    },

    async listar(req, res, next) {
      try {
        const resultado = await listarOcorrencias.executar({
          usuario: req.usuario,
          filtros: {
            categoria: req.query.categoria,
            status: req.query.status,
            prioridade: req.query.prioridade
          },
          paginacao: { page: req.query.page, limit: req.query.limit }
        })

        res.json(resultado)
      } catch (erro) {
        next(erro)
      }
    },

    async obter(req, res, next) {
      try {
        const ocorrencia = await obterOcorrencia.executar({
          id: req.params.id,
          usuario: req.usuario
        })

        res.json(ocorrencia)
      } catch (erro) {
        next(erro)
      }
    }
  }
}

module.exports = criarOcorrenciaController
