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

describe('acoes do gestor, avaliacao e dashboard via HTTP', () => {
  let app
  let ana
  let bruno
  let gestor
  let id

  beforeEach(async () => {
    app = criarApp(criarContainerFake())

    ana = await registrar(app, { nome: 'Ana', email: 'ana@resolveai.com', perfil: 'solicitante' })
    bruno = await registrar(app, { nome: 'Bruno', email: 'bruno@resolveai.com', perfil: 'solicitante' })
    gestor = await registrar(app, { nome: 'Gi', email: 'gi@resolveai.com', perfil: 'gestor' })

    const criada = await request(app)
      .post('/api/ocorrencias')
      .set('Authorization', `Bearer ${ana.token}`)
      .send(OCORRENCIA)

    id = criada.body.id
  })

  it('gestor altera prioridade, responsavel e solucao', async () => {
    const prioridade = await request(app)
      .patch(`/api/ocorrencias/${id}/prioridade`)
      .set('Authorization', `Bearer ${gestor.token}`)
      .send({ prioridade: 'alta' })

    const responsavel = await request(app)
      .patch(`/api/ocorrencias/${id}/responsavel`)
      .set('Authorization', `Bearer ${gestor.token}`)
      .send({ responsavelId: gestor.usuario.id })

    const solucao = await request(app)
      .patch(`/api/ocorrencias/${id}/solucao`)
      .set('Authorization', `Bearer ${gestor.token}`)
      .send({ solucaoAplicada: 'Lampada trocada e reator revisado.' })

    expect(prioridade.status).toBe(200)
    expect(prioridade.body.prioridade).toBe('alta')
    expect(responsavel.status).toBe(200)
    expect(solucao.status).toBe(200)
    expect(solucao.body.solucaoAplicada).toBe('Lampada trocada e reator revisado.')
  })

  it('responsavel que nao e gestor devolve 400', async () => {
    const resposta = await request(app)
      .patch(`/api/ocorrencias/${id}/responsavel`)
      .set('Authorization', `Bearer ${gestor.token}`)
      .send({ responsavelId: ana.usuario.id })

    expect(resposta.status).toBe(400)
  })

  it('solicitante nao executa acao de gestor', async () => {
    const resposta = await request(app)
      .patch(`/api/ocorrencias/${id}/prioridade`)
      .set('Authorization', `Bearer ${ana.token}`)
      .send({ prioridade: 'alta' })

    expect(resposta.status).toBe(403)
  })

  it('avaliacao antes de resolvida devolve 409', async () => {
    const resposta = await request(app)
      .post(`/api/ocorrencias/${id}/avaliacao`)
      .set('Authorization', `Bearer ${ana.token}`)
      .send({ nota: 5 })

    expect(resposta.status).toBe(409)
  })

  it('dono avalia depois de resolvida; outro solicitante recebe 403', async () => {
    for (const status of ['em_analise', 'em_atendimento', 'resolvida']) {
      await request(app)
        .patch(`/api/ocorrencias/${id}/status`)
        .set('Authorization', `Bearer ${gestor.token}`)
        .send({ status })
    }

    const deOutro = await request(app)
      .post(`/api/ocorrencias/${id}/avaliacao`)
      .set('Authorization', `Bearer ${bruno.token}`)
      .send({ nota: 1 })

    const doDono = await request(app)
      .post(`/api/ocorrencias/${id}/avaliacao`)
      .set('Authorization', `Bearer ${ana.token}`)
      .send({ nota: 5, comentario: 'Resolveram no mesmo dia.' })

    expect(deOutro.status).toBe(403)
    expect(doDono.status).toBe(201)
    expect(doDono.body.avaliacao.nota).toBe(5)
  })

  it('gestor tentando avaliar recebe 403', async () => {
    const resposta = await request(app)
      .post(`/api/ocorrencias/${id}/avaliacao`)
      .set('Authorization', `Bearer ${gestor.token}`)
      .send({ nota: 5 })

    expect(resposta.status).toBe(403)
  })

  it('GET /api/dashboard devolve os indicadores para o gestor e 403 para o solicitante', async () => {
    const doGestor = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${gestor.token}`)

    const daAna = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${ana.token}`)

    expect(daAna.status).toBe(403)
    expect(doGestor.status).toBe(200)
    expect(doGestor.body).toMatchObject({
      total: 1,
      porStatus: expect.objectContaining({ aberta: 1, resolvida: 0 }),
      tempoMedioResolucaoHoras: null,
      avaliacaoMedia: null
    })
  })

  it('GET /api/usuarios?perfil=gestor alimenta o seletor de responsavel', async () => {
    const resposta = await request(app)
      .get('/api/usuarios?perfil=gestor')
      .set('Authorization', `Bearer ${gestor.token}`)

    expect(resposta.status).toBe(200)
    expect(resposta.body).toHaveLength(1)
    expect(resposta.body[0].email).toBe('gi@resolveai.com')
    expect(resposta.body[0].senha).toBeUndefined()
  })
})
