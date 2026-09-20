function criarDashboardController({ obterIndicadores }) {
  return {
    async indicadores(req, res, next) {
      try {
        res.json(await obterIndicadores.executar({ usuario: req.usuario }))
      } catch (erro) {
        next(erro)
      }
    }
  }
}

module.exports = criarDashboardController
