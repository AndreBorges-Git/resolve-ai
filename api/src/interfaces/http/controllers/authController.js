// Controller burro: traduz HTTP em chamada de caso de uso e o resultado em resposta.
// Nenhum if de regra de negocio mora aqui.
function criarAuthController({ registrarUsuario, autenticarUsuario, obterUsuarioAutenticado }) {
  return {
    async registrar(req, res, next) {
      try {
        const { nome, email, senha, perfil } = req.body
        const resultado = await registrarUsuario.executar({ nome, email, senha, perfil })

        res.status(201).json(resultado)
      } catch (erro) {
        next(erro)
      }
    },

    async login(req, res, next) {
      try {
        const { email, senha } = req.body
        const resultado = await autenticarUsuario.executar({ email, senha })

        res.status(200).json(resultado)
      } catch (erro) {
        next(erro)
      }
    },

    async eu(req, res, next) {
      try {
        const usuario = await obterUsuarioAutenticado.executar(req.usuario.id)

        res.status(200).json(usuario)
      } catch (erro) {
        next(erro)
      }
    }
  }
}

module.exports = criarAuthController
