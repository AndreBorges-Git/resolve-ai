const ComentarOcorrencia = require('../../src/application/usecases/ComentarOcorrencia')
const ListarComentarios = require('../../src/application/usecases/ListarComentarios')
const Ocorrencia = require('../../src/domain/entities/Ocorrencia')
const ComentarioRepositoryFake = require('../helpers/ComentarioRepositoryFake')
const OcorrenciaRepositoryFake = require('../helpers/OcorrenciaRepositoryFake')

const DONO = { id: 'usuario-1', perfil: 'solicitante' }
const OUTRO = { id: 'usuario-2', perfil: 'solicitante' }
const GESTOR = { id: 'gestor-1', perfil: 'gestor' }

describe('ComentarOcorrencia', () => {
  let ocorrenciaRepository
  let comentarioRepository
  let comentar
  let listar
  let ocorrencia

  beforeEach(async () => {
    ocorrenciaRepository = new OcorrenciaRepositoryFake()
    comentarioRepository = new ComentarioRepositoryFake()
    comentar = new ComentarOcorrencia({ ocorrenciaRepository, comentarioRepository })
    listar = new ListarComentarios({ ocorrenciaRepository, comentarioRepository })

    ocorrencia = await ocorrenciaRepository.salvar(
      new Ocorrencia({
        titulo: 'Lampada queimada no corredor',
        descricao: 'O corredor do segundo andar esta sem iluminacao desde ontem.',
        categoria: 'iluminacao',
        localizacao: 'Bloco B',
        solicitante: DONO.id
      })
    )
  })

  it('o dono comenta', async () => {
    const comentario = await comentar.executar({
      id: ocorrencia.id,
      texto: 'Continua apagado hoje de manha.',
      usuario: DONO
    })

    expect(comentario.texto).toBe('Continua apagado hoje de manha.')
    expect(comentario.autor.id).toBe('usuario-1')
  })

  it('o gestor comenta em ocorrencia de qualquer um', async () => {
    await expect(
      comentar.executar({ id: ocorrencia.id, texto: 'Equipe a caminho.', usuario: GESTOR })
    ).resolves.toMatchObject({ texto: 'Equipe a caminho.' })
  })

  it('outro solicitante nao comenta', async () => {
    await expect(
      comentar.executar({ id: ocorrencia.id, texto: 'Oi', usuario: OUTRO })
    ).rejects.toMatchObject({ name: 'NaoAutorizadoError' })
  })

  it('recusa comentario vazio', async () => {
    await expect(
      comentar.executar({ id: ocorrencia.id, texto: '   ', usuario: DONO })
    ).rejects.toMatchObject({ name: 'ValidacaoError' })
  })

  it('lista os comentarios na ordem em que foram criados', async () => {
    await comentar.executar({ id: ocorrencia.id, texto: 'Primeiro', usuario: DONO })
    await comentar.executar({ id: ocorrencia.id, texto: 'Segundo', usuario: GESTOR })

    const comentarios = await listar.executar({ id: ocorrencia.id, usuario: DONO })

    expect(comentarios.map((item) => item.texto)).toEqual(['Primeiro', 'Segundo'])
  })

  it('outro solicitante nao lista', async () => {
    await expect(listar.executar({ id: ocorrencia.id, usuario: OUTRO })).rejects.toMatchObject({
      name: 'NaoAutorizadoError'
    })
  })
})
