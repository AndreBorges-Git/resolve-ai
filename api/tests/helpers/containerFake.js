const AutenticarUsuario = require('../../src/application/usecases/AutenticarUsuario')
const ListarOcorrencias = require('../../src/application/usecases/ListarOcorrencias')
const ObterOcorrencia = require('../../src/application/usecases/ObterOcorrencia')
const ObterUsuarioAutenticado = require('../../src/application/usecases/ObterUsuarioAutenticado')
const RegistrarOcorrencia = require('../../src/application/usecases/RegistrarOcorrencia')
const RegistrarUsuario = require('../../src/application/usecases/RegistrarUsuario')
const ArmazenamentoImagemFake = require('./ArmazenamentoImagemFake')
const ComentarioRepositoryFake = require('./ComentarioRepositoryFake')
const HasherFake = require('./HasherFake')
const HistoricoRepositoryFake = require('./HistoricoRepositoryFake')
const OcorrenciaRepositoryFake = require('./OcorrenciaRepositoryFake')
const TokenServiceFake = require('./TokenServiceFake')
const UsuarioRepositoryFake = require('./UsuarioRepositoryFake')

// Mesmo container do main/, com a infraestrutura trocada por dubles.
// E o que deixa os testes de HTTP rodarem sem banco.
function criarContainerFake() {
  const usuarioRepository = new UsuarioRepositoryFake()
  const ocorrenciaRepository = new OcorrenciaRepositoryFake()
  const historicoRepository = new HistoricoRepositoryFake()
  const comentarioRepository = new ComentarioRepositoryFake()
  const armazenamentoImagem = new ArmazenamentoImagemFake()
  const hasher = new HasherFake()
  const tokenService = new TokenServiceFake()

  return {
    usuarioRepository,
    ocorrenciaRepository,
    historicoRepository,
    comentarioRepository,
    armazenamentoImagem,
    hasher,
    tokenService,

    registrarUsuario: new RegistrarUsuario({ usuarioRepository, hasher, tokenService }),
    autenticarUsuario: new AutenticarUsuario({ usuarioRepository, hasher, tokenService }),
    obterUsuarioAutenticado: new ObterUsuarioAutenticado({ usuarioRepository }),

    registrarOcorrencia: new RegistrarOcorrencia({
      ocorrenciaRepository,
      historicoRepository,
      armazenamentoImagem
    }),
    listarOcorrencias: new ListarOcorrencias({ ocorrenciaRepository }),
    obterOcorrencia: new ObterOcorrencia({
      ocorrenciaRepository,
      comentarioRepository,
      historicoRepository
    })
  }
}

module.exports = criarContainerFake
