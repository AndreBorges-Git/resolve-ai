const Usuario = require('../../domain/entities/Usuario')
const NaoEncontradoError = require('../../domain/errors/NaoEncontradoError')

class ObterUsuarioAutenticado {
  constructor({ usuarioRepository }) {
    this.usuarioRepository = usuarioRepository
  }

  async executar(usuarioId) {
    const encontrado = await this.usuarioRepository.buscarPorId(usuarioId)

    if (!encontrado) {
      throw new NaoEncontradoError('Usuario nao encontrado')
    }

    return new Usuario(encontrado).paraJSON()
  }
}

module.exports = ObterUsuarioAutenticado
