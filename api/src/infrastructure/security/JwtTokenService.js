const jwt = require('jsonwebtoken')

const TokenService = require('../../application/ports/TokenService')

class JwtTokenService extends TokenService {
  constructor(segredo, expiracao = '7d') {
    super()

    if (!segredo) {
      throw new Error('JWT_SECRET nao configurado')
    }

    this.segredo = segredo
    this.expiracao = expiracao
  }

  gerar(payload) {
    return jwt.sign(payload, this.segredo, { expiresIn: this.expiracao })
  }

  // Devolve o payload, ou null se o token for invalido ou expirado.
  // Quem traduz isso em 401 e o middleware de autenticacao.
  verificar(token) {
    try {
      return jwt.verify(token, this.segredo)
    } catch {
      return null
    }
  }
}

module.exports = JwtTokenService
