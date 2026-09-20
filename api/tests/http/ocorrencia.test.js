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
  const resposta = await request(app)
    .post('/api/auth/registrar')
    .send({ nome, email, senha: 'senha123', perfil })

  return resposta.body.token
}

describe('/api/ocorrencias', () => {
  let app
  let container
  let tokenAna
  let tokenBruno
  let tokenGestor

  beforeEach(async () => {
    container = criarContainerFake()
    app = criarApp(container)

    tokenAna = await registrar(app, { nome: 'Ana', email: 'ana@resolveai.com', perfil: 'solicitante' })
    tokenBruno = await registrar(app, { nome: 'Bruno', email: 'bruno@resolveai.com', perfil: 'solicitante' })
    tokenGestor = await registrar(app, { nome: 'Gi', email: 'gi@resolveai.com', perfil: 'gestor' })
  })

  it('registra a ocorrencia com 201 e status aberta', async () => {
    const resposta = await request(app)
      .post('/api/ocorrencias')
      .set('Authorization', `Bearer ${tokenAna}`)
      .send(OCORRENCIA)

    expect(resposta.status).toBe(201)
    expect(resposta.body.status).toBe('aberta')
    expect(resposta.body.titulo).toBe(OCORRENCIA.titulo)
  })

  it('exige autenticacao', async () => {
    const resposta = await request(app).post('/api/ocorrencias').send(OCORRENCIA)

    expect(resposta.status).toBe(401)
  })

  it('devolve 400 quando falta campo obrigatorio', async () => {
    const resposta = await request(app)
      .post('/api/ocorrencias')
      .set('Authorization', `Bearer ${tokenAna}`)
      .send({ ...OCORRENCIA, categoria: undefined })

    expect(resposta.status).toBe(400)
    expect(resposta.body.erro).toBeDefined()
  })

  it('solicitante nao ve a ocorrencia dos outros na listagem', async () => {
    await request(app).post('/api/ocorrencias').set('Authorization', `Bearer ${tokenAna}`).send(OCORRENCIA)
    await request(app)
      .post('/api/ocorrencias')
      .set('Authorization', `Bearer ${tokenBruno}`)
      .send({ ...OCORRENCIA, titulo: 'Torneira pingando na copa', categoria: 'vazamento' })

    const daAna = await request(app).get('/api/ocorrencias').set('Authorization', `Bearer ${tokenAna}`)
    const doGestor = await request(app).get('/api/ocorrencias').set('Authorization', `Bearer ${tokenGestor}`)

    expect(daAna.body.total).toBe(1)
    expect(daAna.body.itens[0].titulo).toBe(OCORRENCIA.titulo)
    expect(doGestor.body.total).toBe(2)
  })

  it('filtra por status', async () => {
    await request(app).post('/api/ocorrencias').set('Authorization', `Bearer ${tokenAna}`).send(OCORRENCIA)

    const abertas = await request(app)
      .get('/api/ocorrencias?status=aberta')
      .set('Authorization', `Bearer ${tokenAna}`)
    const resolvidas = await request(app)
      .get('/api/ocorrencias?status=resolvida')
      .set('Authorization', `Bearer ${tokenAna}`)

    expect(abertas.body.total).toBe(1)
    expect(resolvidas.body.total).toBe(0)
  })

  it('devolve 400 em filtro invalido', async () => {
    const resposta = await request(app)
      .get('/api/ocorrencias?status=arquivada')
      .set('Authorization', `Bearer ${tokenAna}`)

    expect(resposta.status).toBe(400)
  })

  it('detalha a ocorrencia com comentarios e historico de abertura', async () => {
    const criada = await request(app)
      .post('/api/ocorrencias')
      .set('Authorization', `Bearer ${tokenAna}`)
      .send(OCORRENCIA)

    const resposta = await request(app)
      .get(`/api/ocorrencias/${criada.body.id}`)
      .set('Authorization', `Bearer ${tokenAna}`)

    expect(resposta.status).toBe(200)
    expect(resposta.body.comentarios).toEqual([])
    expect(resposta.body.historico).toHaveLength(1)
    expect(resposta.body.historico[0].statusAnterior).toBeNull()
    expect(resposta.body.historico[0].statusNovo).toBe('aberta')
  })

  it('devolve 403 quando o solicitante abre a ocorrencia de outro', async () => {
    const criada = await request(app)
      .post('/api/ocorrencias')
      .set('Authorization', `Bearer ${tokenAna}`)
      .send(OCORRENCIA)

    const resposta = await request(app)
      .get(`/api/ocorrencias/${criada.body.id}`)
      .set('Authorization', `Bearer ${tokenBruno}`)

    expect(resposta.status).toBe(403)
  })

  it('gestor abre a ocorrencia de qualquer solicitante', async () => {
    const criada = await request(app)
      .post('/api/ocorrencias')
      .set('Authorization', `Bearer ${tokenAna}`)
      .send(OCORRENCIA)

    const resposta = await request(app)
      .get(`/api/ocorrencias/${criada.body.id}`)
      .set('Authorization', `Bearer ${tokenGestor}`)

    expect(resposta.status).toBe(200)
  })

  it('devolve 404 para ocorrencia inexistente', async () => {
    const resposta = await request(app)
      .get('/api/ocorrencias/ocorrencia-inexistente')
      .set('Authorization', `Bearer ${tokenGestor}`)

    expect(resposta.status).toBe(404)
  })

  it('aceita multipart com imagem e guarda a URL', async () => {
    const resposta = await request(app)
      .post('/api/ocorrencias')
      .set('Authorization', `Bearer ${tokenAna}`)
      .field('titulo', OCORRENCIA.titulo)
      .field('descricao', OCORRENCIA.descricao)
      .field('categoria', OCORRENCIA.categoria)
      .field('localizacao', OCORRENCIA.localizacao)
      .attach('imagem', Buffer.from('conteudo-fake'), { filename: 'foto.png', contentType: 'image/png' })

    expect(resposta.status).toBe(201)
    expect(resposta.body.imagemUrl).toBe('https://fake.cloudinary/foto.png')
  })

  it('recusa arquivo que nao e imagem com 400', async () => {
    const resposta = await request(app)
      .post('/api/ocorrencias')
      .set('Authorization', `Bearer ${tokenAna}`)
      .field('titulo', OCORRENCIA.titulo)
      .field('descricao', OCORRENCIA.descricao)
      .field('categoria', OCORRENCIA.categoria)
      .field('localizacao', OCORRENCIA.localizacao)
      .attach('imagem', Buffer.from('nao sou imagem'), { filename: 'nota.pdf', contentType: 'application/pdf' })

    expect(resposta.status).toBe(400)
  })
})
