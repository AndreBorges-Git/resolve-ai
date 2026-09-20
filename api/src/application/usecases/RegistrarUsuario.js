const Usuario = require('../../domain/entities/Usuario')
const ValidacaoError = require('../../domain/errors/ValidacaoError')

class RegistrarUsuario {
  constructor({ usuarioRepository, hasher, tokenService }) {
    this.usuarioRepository = usuarioRepository
    this.hasher = hasher
    this.tokenService = tokenService
  }

  async executar({ nome, email, senha, perfil }) {
    Usuario.validarSenhaEmTextoPlano(senha)

    const emailNormalizado = Usuario.normalizarEmail(email || '')
    const jaExiste = await this.usuarioRepository.buscarPorEmail(emailNormalizado)

    if (jaExiste) {
      throw new ValidacaoError('E-mail já cadastrado')
    }

    const hash = await this.hasher.gerarHash(senha)
    const usuario = new Usuario({ nome, email, senha: hash, perfil })
    const salvo = await this.usuarioRepository.salvar(usuario)

    const token = this.tokenService.gerar({ id: salvo.id, perfil: salvo.perfil })

    return { token, usuario: new Usuario(salvo).paraJSON() }
  }
}

module.exports = RegistrarUsuario
