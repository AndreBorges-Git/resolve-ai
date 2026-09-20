const Usuario = require('../../domain/entities/Usuario')
const { NaoAutorizadoError, ValidacaoError } = require('../../domain/errors')

// Alimenta o seletor de responsavel do painel do gestor.
class ListarUsuarios {
  constructor({ usuarioRepository }) {
    this.usuarioRepository = usuarioRepository
  }

  async executar({ perfil, usuario }) {
    if (usuario.perfil !== 'gestor') {
      throw new NaoAutorizadoError('Apenas gestores consultam a lista de usuarios')
    }

    if (perfil && !Usuario.PERFIS.includes(perfil)) {
      throw new ValidacaoError(`perfil invalido. Use: ${Usuario.PERFIS.join(', ')}`)
    }

    return this.usuarioRepository.listar({ perfil })
  }
}

module.exports = ListarUsuarios
