// Contrato implementado por infrastructure/database/mongoose/repositories.
// Em CommonJS, "interface" e uma classe cujos metodos lancam.
class UsuarioRepository {
  async salvar(usuario) {
    throw new Error('não implementado')
  }

  async buscarPorId(id) {
    throw new Error('não implementado')
  }

  async buscarPorEmail(email) {
    throw new Error('não implementado')
  }

  // Devolve o usuario com o hash da senha. Usado so pela autenticacao.
  async buscarPorEmailComSenha(email) {
    throw new Error('não implementado')
  }

  async listar(filtros) {
    throw new Error('não implementado')
  }
}

module.exports = UsuarioRepository
