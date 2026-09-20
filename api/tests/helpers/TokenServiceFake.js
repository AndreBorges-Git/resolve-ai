const TokenService = require('../../src/application/ports/TokenService')

class TokenServiceFake extends TokenService {
  gerar(payload) {
    return `token:${payload.id}:${payload.perfil}`
  }

  verificar(token) {
    if (typeof token !== 'string' || !token.startsWith('token:')) {
      return null
    }

    const [, id, perfil] = token.split(':')

    return { id, perfil }
  }
}

module.exports = TokenServiceFake
