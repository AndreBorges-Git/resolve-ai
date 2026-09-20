// Controller burro: le o HTTP, chama o caso de uso, devolve o status.
// Nenhuma regra de negocio mora aqui.
function criarOcorrenciaController({
  registrarOcorrencia,
  listarOcorrencias,
  obterOcorrencia,
  alterarStatusOcorrencia,
  comentarOcorrencia,
  listarComentarios,
  listarHistorico
}) {
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

    async alterarStatus(req, res, next) {
      try {
        const ocorrencia = await alterarStatusOcorrencia.executar({
          id: req.params.id,
          status: req.body.status,
          observacao: req.body.observacao,
          usuario: req.usuario
        })

        res.json(ocorrencia)
      } catch (erro) {
        next(erro)
      }
    },

    async comentar(req, res, next) {
      try {
        const comentario = await comentarOcorrencia.executar({
          id: req.params.id,
          texto: req.body.texto,
          usuario: req.usuario
        })

        res.status(201).json(comentario)
      } catch (erro) {
        next(erro)
      }
    },

    async comentarios(req, res, next) {
      try {
        res.json(await listarComentarios.executar({ id: req.params.id, usuario: req.usuario }))
      } catch (erro) {
        next(erro)
      }
    },

    async historico(req, res, next) {
      try {
        res.json(await listarHistorico.executar({ id: req.params.id, usuario: req.usuario }))
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
