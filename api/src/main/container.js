const AlterarStatusOcorrencia = require('../application/usecases/AlterarStatusOcorrencia')
const AutenticarUsuario = require('../application/usecases/AutenticarUsuario')
const ComentarOcorrencia = require('../application/usecases/ComentarOcorrencia')
const ListarComentarios = require('../application/usecases/ListarComentarios')
const ListarHistorico = require('../application/usecases/ListarHistorico')
const ListarOcorrencias = require('../application/usecases/ListarOcorrencias')
const ObterOcorrencia = require('../application/usecases/ObterOcorrencia')
const ObterUsuarioAutenticado = require('../application/usecases/ObterUsuarioAutenticado')
const RegistrarOcorrencia = require('../application/usecases/RegistrarOcorrencia')
const RegistrarUsuario = require('../application/usecases/RegistrarUsuario')
const ComentarioRepositoryMongoose = require('../infrastructure/database/mongoose/repositories/ComentarioRepositoryMongoose')
const HistoricoRepositoryMongoose = require('../infrastructure/database/mongoose/repositories/HistoricoRepositoryMongoose')
const OcorrenciaRepositoryMongoose = require('../infrastructure/database/mongoose/repositories/OcorrenciaRepositoryMongoose')
const UsuarioRepositoryMongoose = require('../infrastructure/database/mongoose/repositories/UsuarioRepositoryMongoose')
const BcryptHasher = require('../infrastructure/security/BcryptHasher')
const JwtTokenService = require('../infrastructure/security/JwtTokenService')
const CloudinaryArmazenamentoImagem = require('../infrastructure/storage/CloudinaryArmazenamentoImagem')

// Unico lugar do projeto que conhece todas as camadas ao mesmo tempo.
// Trocar Mongo por outro banco = trocar as linhas de repositorio daqui.
function criarContainer({ jwtSecret = process.env.JWT_SECRET, jwtExpiracao = '7d' } = {}) {
  const usuarioRepository = new UsuarioRepositoryMongoose()
  const ocorrenciaRepository = new OcorrenciaRepositoryMongoose()
  const historicoRepository = new HistoricoRepositoryMongoose()
  const comentarioRepository = new ComentarioRepositoryMongoose()
  const armazenamentoImagem = new CloudinaryArmazenamentoImagem({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  })
  const hasher = new BcryptHasher()
  const tokenService = new JwtTokenService(jwtSecret, jwtExpiracao)

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

    alterarStatusOcorrencia: new AlterarStatusOcorrencia({
      ocorrenciaRepository,
      historicoRepository
    }),
    comentarOcorrencia: new ComentarOcorrencia({ ocorrenciaRepository, comentarioRepository }),
    listarComentarios: new ListarComentarios({ ocorrenciaRepository, comentarioRepository }),
    listarHistorico: new ListarHistorico({ ocorrenciaRepository, historicoRepository }),
    obterOcorrencia: new ObterOcorrencia({
      ocorrenciaRepository,
      comentarioRepository,
      historicoRepository
    })
  }
}

module.exports = criarContainer
