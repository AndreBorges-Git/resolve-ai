const AutenticarUsuario = require('../../src/application/usecases/AutenticarUsuario')
const ObterUsuarioAutenticado = require('../../src/application/usecases/ObterUsuarioAutenticado')
const RegistrarUsuario = require('../../src/application/usecases/RegistrarUsuario')
const HasherFake = require('./HasherFake')
const TokenServiceFake = require('./TokenServiceFake')
const UsuarioRepositoryFake = require('./UsuarioRepositoryFake')

// Mesmo container do main/, com a infraestrutura trocada por dubles.
// E o que deixa os testes de HTTP rodarem sem banco.
function criarContainerFake() {
  const usuarioRepository = new UsuarioRepositoryFake()
  const hasher = new HasherFake()
  const tokenService = new TokenServiceFake()

  return {
    usuarioRepository,
    hasher,
    tokenService,

    registrarUsuario: new RegistrarUsuario({ usuarioRepository, hasher, tokenService }),
    autenticarUsuario: new AutenticarUsuario({ usuarioRepository, hasher, tokenService }),
    obterUsuarioAutenticado: new ObterUsuarioAutenticado({ usuarioRepository })
  }
}

module.exports = criarContainerFake
