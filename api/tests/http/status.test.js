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

  return body.token
}

describe('PATCH /api/ocorrencias/:id/status e comentarios', () => {
  let app
  let tokenAna
  let tokenBruno
  let tokenGestor
  let id

  async function mover(token, status, observacao) {
    return request(app)
      .patch(`/api/ocorrencias/${id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status, observacao })
  }

  beforeEach(async () => {
    app = criarApp(criarContainerFake())

    tokenAna = await registrar(app, { nome: 'Ana', email: 'ana@resolveai.com', perfil: 'solicitante' })
    tokenBruno = await registrar(app, { nome: 'Bruno', email: 'bruno@resolveai.com', perfil: 'solicitante' })
    tokenGestor = await registrar(app, { nome: 'Gi', email: 'gi@resolveai.com', perfil: 'gestor' })

    const criada = await request(app)
      .post('/api/ocorrencias')
      .set('Authorization', `Bearer ${tokenAna}`)
      .send(OCORRENCIA)

    id = criada.body.id
  })

  it('gestor move aberta -> em_analise e o historico cresce', async () => {
    const resposta = await mover(tokenGestor, 'em_analise', 'Equipe avisada')

    expect(resposta.status).toBe(200)
    expect(resposta.body.status).toBe('em_analise')

    const historico = await request(app)
      .get(`/api/ocorrencias/${id}/historico`)
      .set('Authorization', `Bearer ${tokenAna}`)

    expect(historico.body).toHaveLength(2)
    expect(historico.body[1]).toMatchObject({
      statusAnterior: 'aberta',
      statusNovo: 'em_analise',
      observacao: 'Equipe avisada'
    })
  })

  it('transicao invalida devolve 409', async () => {
    const resposta = await mover(tokenGestor, 'resolvida')

    expect(resposta.status).toBe(409)
    expect(resposta.body.erro).toMatch(/aberta/)
  })

  it('solicitante alterando status devolve 403', async () => {
    const resposta = await mover(tokenAna, 'em_analise')

    expect(resposta.status).toBe(403)
  })

  it('status fora do dominio devolve 400', async () => {
    const resposta = await mover(tokenGestor, 'arquivada')

    expect(resposta.status).toBe(400)
  })

  it('percorre o fluxo completo ate resolvida', async () => {
    await mover(tokenGestor, 'em_analise')
    await mover(tokenGestor, 'em_atendimento')
    const resolvida = await mover(tokenGestor, 'resolvida', 'Lampada trocada')

    expect(resolvida.status).toBe(200)
    expect(resolvida.body.status).toBe('resolvida')
    expect(resolvida.body.resolvidaEm).not.toBeNull()

    const detalhe = await request(app)
      .get(`/api/ocorrencias/${id}`)
      .set('Authorization', `Bearer ${tokenAna}`)

    expect(detalhe.body.historico.map((item) => item.statusNovo)).toEqual([
      'aberta',
      'em_analise',
      'em_atendimento',
      'resolvida'
    ])
  })

  it('dono e gestor comentam; outro solicitante recebe 403', async () => {
    const doDono = await request(app)
      .post(`/api/ocorrencias/${id}/comentarios`)
      .set('Authorization', `Bearer ${tokenAna}`)
      .send({ texto: 'Continua apagado hoje de manha.' })

    const doGestor = await request(app)
      .post(`/api/ocorrencias/${id}/comentarios`)
      .set('Authorization', `Bearer ${tokenGestor}`)
      .send({ texto: 'Equipe a caminho.' })

    const deOutro = await request(app)
      .post(`/api/ocorrencias/${id}/comentarios`)
      .set('Authorization', `Bearer ${tokenBruno}`)
      .send({ texto: 'Oi' })

    expect(doDono.status).toBe(201)
    expect(doGestor.status).toBe(201)
    expect(deOutro.status).toBe(403)

    const lista = await request(app)
      .get(`/api/ocorrencias/${id}/comentarios`)
      .set('Authorization', `Bearer ${tokenAna}`)

    expect(lista.body.map((item) => item.texto)).toEqual([
      'Continua apagado hoje de manha.',
      'Equipe a caminho.'
    ])
  })

  it('comentario vazio devolve 400', async () => {
    const resposta = await request(app)
      .post(`/api/ocorrencias/${id}/comentarios`)
      .set('Authorization', `Bearer ${tokenAna}`)
      .send({ texto: '' })

    expect(resposta.status).toBe(400)
  })

  it('historico de outro solicitante devolve 403', async () => {
    const resposta = await request(app)
      .get(`/api/ocorrencias/${id}/historico`)
      .set('Authorization', `Bearer ${tokenBruno}`)

    expect(resposta.status).toBe(403)
  })
})
