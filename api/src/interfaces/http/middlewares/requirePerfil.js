const NaoAutorizadoError = require('../../../domain/errors/NaoAutorizadoError')

// requirePerfil('gestor') — barra por perfil antes de chegar ao caso de uso.
function requirePerfil(...perfisPermitidos) {
  return function verificarPerfil(req, res, next) {
    if (!req.usuario || !perfisPermitidos.includes(req.usuario.perfil)) {
      return next(new NaoAutorizadoError())
    }

    return next()
  }
}

module.exports = requirePerfil
