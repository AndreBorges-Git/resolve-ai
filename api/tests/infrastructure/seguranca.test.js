const BcryptHasher = require('../../src/infrastructure/security/BcryptHasher')
const JwtTokenService = require('../../src/infrastructure/security/JwtTokenService')

// Adaptadores das portas Hasher e TokenService. Sao as duas pecas de
// infraestrutura que rodam sem rede, entao da para testar de verdade em vez
// de confiar que a lib faz o certo.
describe('BcryptHasher', () => {
  const hasher = new BcryptHasher(4)

  it('gera hash diferente da senha e confirma a comparacao', async () => {
    const hash = await hasher.gerarHash('senha123')

    expect(hash).not.toBe('senha123')
    expect(await hasher.comparar('senha123', hash)).toBe(true)
  })

  it('recusa senha errada', async () => {
    const hash = await hasher.gerarHash('senha123')

    expect(await hasher.comparar('outra', hash)).toBe(false)
  })

  it('a mesma senha gera hashes distintos, porque o sal e por hash', async () => {
    const primeiro = await hasher.gerarHash('senha123')
    const segundo = await hasher.gerarHash('senha123')

    expect(primeiro).not.toBe(segundo)
  })

  // Usuario sem senha gravada nao pode virar login liberado por acidente.
  it('sem hash devolve false em vez de estourar', async () => {
    expect(await hasher.comparar('senha123', null)).toBe(false)
    expect(await hasher.comparar('senha123', undefined)).toBe(false)
  })
})

describe('JwtTokenService', () => {
  const servico = new JwtTokenService('segredo-de-teste')

  it('gera token que volta com o payload', () => {
    const token = servico.gerar({ id: 'abc123', perfil: 'gestor' })
    const payload = servico.verificar(token)

    expect(payload.id).toBe('abc123')
    expect(payload.perfil).toBe('gestor')
  })

  it('devolve null para token adulterado, e nao lanca', () => {
    expect(servico.verificar('nao.e.um.token')).toBeNull()
  })

  it('devolve null para token assinado com outro segredo', () => {
    const outro = new JwtTokenService('segredo-diferente')

    expect(servico.verificar(outro.gerar({ id: 'abc123' }))).toBeNull()
  })

  it('devolve null para token expirado', () => {
    const curto = new JwtTokenService('segredo-de-teste', '-1s')

    expect(curto.verificar(curto.gerar({ id: 'abc123' }))).toBeNull()
  })

  // Sem isto um deploy sem JWT_SECRET subiria assinando com segredo vazio.
  it('recusa nascer sem segredo', () => {
    expect(() => new JwtTokenService()).toThrow(/JWT_SECRET/)
    expect(() => new JwtTokenService('')).toThrow(/JWT_SECRET/)
  })
})
