const request = require('supertest')

const criarApp = require('../../src/main/app')
const criarContainerFake = require('../helpers/containerFake')

const OCORRENCIA = {
  titulo: 'Lampada queimada no corredor',
  descricao: 'O corredor do segundo andar esta sem iluminacao desde ontem.',
  categoria: 'iluminacao',
  localizacao: 'Bloco B, segundo andar'
}

async function registrar(app, { nome, email, perfil }) {
  const { body } = await request(app)
    .post('/api/auth/registrar')
    .send({ nome, email, senha: 'senha123', perfil })

  return body
}

describe('cabecalhos de seguranca', () => {
  it('helmet remove a assinatura do Express e liga as protecoes de navegador', async () => {
    const app = criarApp(criarContainerFake())
    const resposta = await request(app).get('/api/health')

    expect(resposta.status).toBe(200)
    expect(resposta.headers['x-powered-by']).toBeUndefined()
    expect(resposta.headers['x-content-type-options']).toBe('nosniff')
    expect(resposta.headers['x-frame-options']).toBe('SAMEORIGIN')
  })

  it('mantem a politica de recurso aberta, senao o front em outro dominio nao consome a API', async () => {
    const app = criarApp(criarContainerFake())
    const resposta = await request(app).get('/api/health')

    expect(resposta.headers['cross-origin-resource-policy']).toBe('cross-origin')
  })
})

describe('limite de tentativas no login', () => {
  it('passa do limite e responde 429 sem revelar nada sobre a conta', async () => {
    const app = criarApp(criarContainerFake(), { limiteLogin: 3 })
    const credenciais = { email: 'ninguem@resolveai.com', senha: 'errada' }

    const primeiras = []

    for (let tentativa = 0; tentativa < 3; tentativa += 1) {
      primeiras.push(await request(app).post('/api/auth/login').send(credenciais))
    }

    const bloqueada = await request(app).post('/api/auth/login').send(credenciais)

    expect(primeiras.map((resposta) => resposta.status)).toEqual([401, 401, 401])
    expect(bloqueada.status).toBe(429)
    expect(bloqueada.body.erro).toMatch(/Muitas tentativas/)
  })

  it('nao limita as demais rotas de autenticacao', async () => {
    const app = criarApp(criarContainerFake(), { limiteLogin: 1 })

    await request(app).post('/api/auth/login').send({ email: 'a@a.com', senha: 'x' })

    const registro = await request(app)
      .post('/api/auth/registrar')
      .send({ nome: 'Ana Souza', email: 'ana@resolveai.com', senha: 'senha123', perfil: 'solicitante' })

    expect(registro.status).toBe(201)
  })
})

describe('quem pode abrir ocorrencia', () => {
  let app

  beforeEach(() => {
    app = criarApp(criarContainerFake())
  })

  it('solicitante abre e recebe 201', async () => {
    const ana = await registrar(app, {
      nome: 'Ana Souza',
      email: 'ana@resolveai.com',
      perfil: 'solicitante'
    })

    const resposta = await request(app)
      .post('/api/ocorrencias')
      .set('Authorization', `Bearer ${ana.token}`)
      .send(OCORRENCIA)

    expect(resposta.status).toBe(201)
  })

  // A espec atribui a abertura ao solicitante: o gestor conduz o que existe.
  it('gestor tentando abrir recebe 403', async () => {
    const gestor = await registrar(app, {
      nome: 'Carla Dias',
      email: 'carla@resolveai.com',
      perfil: 'gestor'
    })

    const resposta = await request(app)
      .post('/api/ocorrencias')
      .set('Authorization', `Bearer ${gestor.token}`)
      .send(OCORRENCIA)

    expect(resposta.status).toBe(403)
  })
})

describe('o limite nao pune quem acerta a senha', () => {
  it('logins corretos em serie continuam passando', async () => {
    const app = criarApp(criarContainerFake(), { limiteLogin: 2 })

    await registrar(app, { nome: 'Ana Souza', email: 'ana@resolveai.com', perfil: 'solicitante' })

    const credenciais = { email: 'ana@resolveai.com', senha: 'senha123' }
    const codigos = []

    for (let tentativa = 0; tentativa < 5; tentativa += 1) {
      const resposta = await request(app).post('/api/auth/login').send(credenciais)
      codigos.push(resposta.status)
    }

    expect(codigos).toEqual([200, 200, 200, 200, 200])
  })
})
