function criarUsuarioController({ listarUsuarios }) {
  return {
    async listar(req, res, next) {
      try {
        res.json(await listarUsuarios.executar({ perfil: req.query.perfil, usuario: req.usuario }))
      } catch (erro) {
        next(erro)
      }
    }
  }
}

module.exports = criarUsuarioController
