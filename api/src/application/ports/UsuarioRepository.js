// Contrato implementado por infrastructure/database/mongoose/repositories.
// Em CommonJS, "interface" e uma classe cujos metodos lancam.
class UsuarioRepository {
  async salvar(usuario) {
    throw new Error('nao implementado')
  }

  async buscarPorId(id) {
    throw new Error('nao implementado')
  }

  async buscarPorEmail(email) {
    throw new Error('nao implementado')
  }

  // Devolve o usuario com o hash da senha. Usado so pela autenticacao.
  async buscarPorEmailComSenha(email) {
    throw new Error('nao implementado')
  }

  async listar(filtros) {
    throw new Error('nao implementado')
  }
}

module.exports = UsuarioRepository
