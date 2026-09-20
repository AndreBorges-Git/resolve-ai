const UsuarioRepository = require('../../src/application/ports/UsuarioRepository')

// Repositorio em memoria: e o que permite testar caso de uso sem subir Mongo.
class UsuarioRepositoryFake extends UsuarioRepository {
  constructor(usuariosIniciais = []) {
    super()
    this.usuarios = [...usuariosIniciais]
    this.proximoId = this.usuarios.length + 1
  }

  async salvar(usuario) {
    const registro = {
      id: usuario.id || String(this.proximoId++),
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      perfil: usuario.perfil,
      createdAt: new Date()
    }

    this.usuarios.push(registro)

    return this.semSenha(registro)
  }

  async buscarPorId(id) {
    const encontrado = this.usuarios.find((usuario) => usuario.id === id)

    return encontrado ? this.semSenha(encontrado) : null
  }

  async buscarPorEmail(email) {
    const encontrado = this.usuarios.find((usuario) => usuario.email === email)

    return encontrado ? this.semSenha(encontrado) : null
  }

  async buscarPorEmailComSenha(email) {
    const encontrado = this.usuarios.find((usuario) => usuario.email === email)

    return encontrado ? { ...encontrado } : null
  }

  async listar({ perfil } = {}) {
    return this.usuarios
      .filter((usuario) => !perfil || usuario.perfil === perfil)
      .map((usuario) => this.semSenha(usuario))
  }

  semSenha(registro) {
    const { senha, ...resto } = registro

    return resto
  }
}

module.exports = UsuarioRepositoryFake
