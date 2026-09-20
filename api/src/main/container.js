const AutenticarUsuario = require('../application/usecases/AutenticarUsuario')
const ObterUsuarioAutenticado = require('../application/usecases/ObterUsuarioAutenticado')
const RegistrarUsuario = require('../application/usecases/RegistrarUsuario')
const UsuarioRepositoryMongoose = require('../infrastructure/database/mongoose/repositories/UsuarioRepositoryMongoose')
const BcryptHasher = require('../infrastructure/security/BcryptHasher')
const JwtTokenService = require('../infrastructure/security/JwtTokenService')

// Unico lugar do projeto que conhece todas as camadas ao mesmo tempo.
// Trocar Mongo por outro banco = trocar as linhas de repositorio daqui.
function criarContainer({ jwtSecret = process.env.JWT_SECRET, jwtExpiracao = '7d' } = {}) {
  const usuarioRepository = new UsuarioRepositoryMongoose()
  const hasher = new BcryptHasher()
  const tokenService = new JwtTokenService(jwtSecret, jwtExpiracao)

  return {
    usuarioRepository,
    hasher,
    tokenService,

    registrarUsuario: new RegistrarUsuario({ usuarioRepository, hasher, tokenService }),
    autenticarUsuario: new AutenticarUsuario({ usuarioRepository, hasher, tokenService }),
    obterUsuarioAutenticado: new ObterUsuarioAutenticado({ usuarioRepository })
  }
}

module.exports = criarContainer
