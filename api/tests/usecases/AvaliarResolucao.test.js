const AvaliarResolucao = require('../../src/application/usecases/AvaliarResolucao')
const Ocorrencia = require('../../src/domain/entities/Ocorrencia')
const OcorrenciaRepositoryFake = require('../helpers/OcorrenciaRepositoryFake')

const DONO = { id: 'usuario-1', perfil: 'solicitante' }
const OUTRO = { id: 'usuario-2', perfil: 'solicitante' }

describe('AvaliarResolucao', () => {
  let ocorrenciaRepository
  let usecase

  async function criar(status) {
    return ocorrenciaRepository.salvar(
      new Ocorrencia({
        titulo: 'Lampada queimada no corredor',
        descricao: 'O corredor do segundo andar esta sem iluminacao desde ontem.',
        categoria: 'iluminacao',
        localizacao: 'Bloco B',
        solicitante: DONO.id,
        status
      })
    )
  }

  beforeEach(() => {
    ocorrenciaRepository = new OcorrenciaRepositoryFake()
    usecase = new AvaliarResolucao({ ocorrenciaRepository })
  })

  it('avaliar ocorrencia nao resolvida lanca TransicaoInvalidaError', async () => {
    const criada = await criar('em_atendimento')

    await expect(
      usecase.executar({ id: criada.id, nota: 5, usuario: DONO })
    ).rejects.toMatchObject({ name: 'TransicaoInvalidaError' })
  })

  it('avaliar ocorrencia resolvida funciona', async () => {
    const criada = await criar('resolvida')

    const avaliada = await usecase.executar({
      id: criada.id,
      nota: 5,
      comentario: 'Resolveram no mesmo dia.',
      usuario: DONO
    })

    expect(avaliada.avaliacao.nota).toBe(5)
    expect(avaliada.avaliacao.comentario).toBe('Resolveram no mesmo dia.')
    expect(avaliada.avaliacao.data).toBeInstanceOf(Date)
  })

  it('so o dono avalia', async () => {
    const criada = await criar('resolvida')

    await expect(
      usecase.executar({ id: criada.id, nota: 4, usuario: OUTRO })
    ).rejects.toMatchObject({ name: 'NaoAutorizadoError' })
  })

  it('nota fora de 1 a 5 e erro de validacao', async () => {
    const criada = await criar('resolvida')

    for (const nota of [0, 6, 2.5, 'cinco', null]) {
      await expect(
        usecase.executar({ id: criada.id, nota, usuario: DONO })
      ).rejects.toMatchObject({ name: 'ValidacaoError' })
    }
  })

  it('nao permite avaliar duas vezes', async () => {
    const criada = await criar('resolvida')

    await usecase.executar({ id: criada.id, nota: 5, usuario: DONO })

    await expect(
      usecase.executar({ id: criada.id, nota: 1, usuario: DONO })
    ).rejects.toMatchObject({ name: 'TransicaoInvalidaError' })
  })
})
