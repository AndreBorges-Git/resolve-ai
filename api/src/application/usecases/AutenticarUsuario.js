const Usuario = require('../../domain/entities/Usuario')
const NaoAutenticadoError = require('../../domain/errors/NaoAutenticadoError')

class AutenticarUsuario {
  constructor({ usuarioRepository, hasher, tokenService }) {
    this.usuarioRepository = usuarioRepository
    this.hasher = hasher
    this.tokenService = tokenService
  }

  async executar({ email, senha }) {
    if (!email || !senha) {
      throw new NaoAutenticadoError('E-mail e senha sao obrigatorios')
    }

    const emailNormalizado = Usuario.normalizarEmail(email)
    const encontrado = await this.usuarioRepository.buscarPorEmailComSenha(emailNormalizado)

    // Mesma mensagem para e-mail inexistente e senha errada: nao entrega
    // ao atacante a informacao de quais e-mails estao cadastrados.
    if (!encontrado) {
      throw new NaoAutenticadoError()
    }

    const senhaConfere = await this.hasher.comparar(senha, encontrado.senha)

    if (!senhaConfere) {
      throw new NaoAutenticadoError()
    }

    const token = this.tokenService.gerar({ id: encontrado.id, perfil: encontrado.perfil })

    return { token, usuario: new Usuario(encontrado).paraJSON() }
  }
}

module.exports = AutenticarUsuario
