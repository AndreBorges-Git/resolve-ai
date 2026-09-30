const fs = require('fs')
const path = require('path')

const criarContainer = require('../../src/main/container')

const PASTA_USECASES = path.join(__dirname, '..', '..', 'src', 'application', 'usecases')

function chaveDoCasoDeUso(arquivo) {
  const nome = path.basename(arquivo, '.js')

  return nome.charAt(0).toLowerCase() + nome.slice(1)
}

// Montar o container nao abre conexao: os repositorios Mongoose so usam a
// conexao quando alguem chama um metodo. Por isso da para testar a montagem
// sem banco, que e onde um caso de uso esquecido apareceria.
describe('container de producao', () => {
  const container = criarContainer({ jwtSecret: 'segredo-de-teste' })

  it('entrega a infraestrutura real nas portas', () => {
    expect(container.hasher.constructor.name).toBe('BcryptHasher')
    expect(container.tokenService.constructor.name).toBe('JwtTokenService')
    expect(container.armazenamentoImagem.constructor.name).toBe('CloudinaryArmazenamentoImagem')
    expect(container.usuarioRepository.constructor.name).toBe('UsuarioRepositoryMongoose')
    expect(container.ocorrenciaRepository.constructor.name).toBe('OcorrenciaRepositoryMongoose')
    expect(container.historicoRepository.constructor.name).toBe('HistoricoRepositoryMongoose')
    expect(container.comentarioRepository.constructor.name).toBe('ComentarioRepositoryMongoose')
  })

  // Caso de uso novo que ninguem ligou no container e codigo morto: existe,
  // tem teste, e nenhuma rota alcanca. Este teste transforma isso em falha.
  it('liga todos os casos de uso que existem na pasta', () => {
    const naPasta = fs
      .readdirSync(PASTA_USECASES)
      .filter((arquivo) => arquivo.endsWith('.js'))
      .map(chaveDoCasoDeUso)

    const faltando = naPasta.filter((chave) => typeof container[chave]?.executar !== 'function')

    expect(faltando).toEqual([])
    expect(naPasta.length).toBeGreaterThan(0)
  })

  it('o token do container assina e verifica de verdade', () => {
    const token = container.tokenService.gerar({ id: 'abc123', perfil: 'gestor' })

    expect(container.tokenService.verificar(token).perfil).toBe('gestor')
  })

  // Deploy sem JWT_SECRET tem de falhar ao subir, nao ao primeiro login.
  // O valor do ambiente sai de cena aqui de proposito: no CI ele existe, e o
  // teste tem de medir a ausencia, nao o que esta configurado na maquina.
  it('recusa montar sem JWT_SECRET', () => {
    const original = process.env.JWT_SECRET
    delete process.env.JWT_SECRET

    try {
      expect(() => criarContainer()).toThrow(/JWT_SECRET/)
      expect(() => criarContainer({ jwtSecret: '' })).toThrow(/JWT_SECRET/)
    } finally {
      if (original === undefined) {
        delete process.env.JWT_SECRET
      } else {
        process.env.JWT_SECRET = original
      }
    }
  })
})
