const NaoAutenticadoError = require('../../../domain/errors/NaoAutenticadoError')

// Fabrica: recebe o TokenService pelo container, nao o importa direto.
function criarAuth(tokenService) {
  return function auth(req, res, next) {
    const cabecalho = req.headers.authorization || ''
    const [esquema, token] = cabecalho.split(' ')

    if (esquema !== 'Bearer' || !token) {
      return next(new NaoAutenticadoError('Token nao informado'))
    }

    const payload = tokenService.verificar(token)

    if (!payload) {
      return next(new NaoAutenticadoError('Token invalido ou expirado'))
    }

    req.usuario = { id: payload.id, perfil: payload.perfil }

    return next()
  }
}

module.exports = criarAuth
