const request = require('supertest')

const criarApp = require('../../src/main/app')
const criarContainerFake = require('../helpers/containerFake')

function montarApp() {
  const container = criarContainerFake()

  return { app: criarApp(container), container }
}

const novoUsuario = {
  nome: 'Ana Souza',
  email: 'ana@resolveai.com',
  senha: 'Senha123',
  perfil: 'solicitante'
}

describe('POST /api/auth/registrar', () => {
  it('registra e responde 201 com token e usuario sem senha', async () => {
    const { app } = montarApp()

    const resposta = await request(app).post('/api/auth/registrar').send(novoUsuario)

    expect(resposta.status).toBe(201)
    expect(resposta.body.token).toBeTruthy()
    expect(resposta.body.usuario.email).toBe('ana@resolveai.com')
    expect(resposta.body.usuario.senha).toBeUndefined()
  })

  it('guarda a senha hasheada, nao em texto plano', async () => {
    const { app, container } = montarApp()

    await request(app).post('/api/auth/registrar').send(novoUsuario)
    const gravado = await container.usuarioRepository.buscarPorEmailComSenha('ana@resolveai.com')

    expect(gravado.senha).not.toBe('Senha123')
  })

  it('responde 400 para e-mail ja cadastrado', async () => {
    const { app } = montarApp()

    await request(app).post('/api/auth/registrar').send(novoUsuario)
    const resposta = await request(app).post('/api/auth/registrar').send(novoUsuario)

    expect(resposta.status).toBe(400)
    expect(resposta.body.erro).toBeDefined()
  })

  it('responde 400 para payload invalido', async () => {
    const { app } = montarApp()

    const resposta = await request(app)
      .post('/api/auth/registrar')
      .send({ email: 'sem-nome@resolveai.com', senha: 'Senha123' })

    expect(resposta.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('responde 200 com token para credenciais corretas', async () => {
    const { app } = montarApp()

    await request(app).post('/api/auth/registrar').send(novoUsuario)
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: novoUsuario.email, senha: novoUsuario.senha })

    expect(resposta.status).toBe(200)
    expect(resposta.body.token).toBeTruthy()
  })

  it('responde 401 para senha errada', async () => {
    const { app } = montarApp()

    await request(app).post('/api/auth/registrar').send(novoUsuario)
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: novoUsuario.email, senha: 'errada' })

    expect(resposta.status).toBe(401)
  })
})

describe('GET /api/auth/eu', () => {
  it('devolve o usuario autenticado com token valido', async () => {
    const { app } = montarApp()

    const registro = await request(app).post('/api/auth/registrar').send(novoUsuario)
    const resposta = await request(app)
      .get('/api/auth/eu')
      .set('Authorization', `Bearer ${registro.body.token}`)

    expect(resposta.status).toBe(200)
    expect(resposta.body.email).toBe('ana@resolveai.com')
    expect(resposta.body.senha).toBeUndefined()
  })

  it('responde 401 sem token', async () => {
    const { app } = montarApp()

    const resposta = await request(app).get('/api/auth/eu')

    expect(resposta.status).toBe(401)
  })

  it('responde 401 com token invalido', async () => {
    const { app } = montarApp()

    const resposta = await request(app).get('/api/auth/eu').set('Authorization', 'Bearer xpto')

    expect(resposta.status).toBe(401)
  })
})
