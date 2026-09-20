const request = require('supertest')

const criarApp = require('../../src/main/app')
const criarContainerFake = require('../helpers/containerFake')

const app = criarApp(criarContainerFake())

describe('GET /api/health', () => {
  it('responde 200 com status ok e timestamp', async () => {
    const resposta = await request(app).get('/api/health')

    expect(resposta.status).toBe(200)
    expect(resposta.body.status).toBe('ok')
    expect(Date.parse(resposta.body.timestamp)).not.toBeNaN()
  })

  it('responde 404 em JSON para rota inexistente', async () => {
    const resposta = await request(app).get('/api/nao-existe')

    expect(resposta.status).toBe(404)
    expect(resposta.body.erro).toBeDefined()
  })
})
