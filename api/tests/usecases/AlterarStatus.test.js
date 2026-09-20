const AlterarStatusOcorrencia = require('../../src/application/usecases/AlterarStatusOcorrencia')
const Ocorrencia = require('../../src/domain/entities/Ocorrencia')
const HistoricoRepositoryFake = require('../helpers/HistoricoRepositoryFake')
const OcorrenciaRepositoryFake = require('../helpers/OcorrenciaRepositoryFake')

const GESTOR = { id: 'gestor-1', perfil: 'gestor' }
const SOLICITANTE = { id: 'usuario-1', perfil: 'solicitante' }

describe('AlterarStatusOcorrencia', () => {
  let ocorrenciaRepository
  let historicoRepository
  let usecase

  async function criar(status = 'aberta') {
    return ocorrenciaRepository.salvar(
      new Ocorrencia({
        titulo: 'Lampada queimada no corredor',
        descricao: 'O corredor do segundo andar esta sem iluminacao desde ontem.',
        categoria: 'iluminacao',
        localizacao: 'Bloco B',
        solicitante: SOLICITANTE.id,
        status
      })
    )
  }

  beforeEach(() => {
    ocorrenciaRepository = new OcorrenciaRepositoryFake()
    historicoRepository = new HistoricoRepositoryFake()
    usecase = new AlterarStatusOcorrencia({ ocorrenciaRepository, historicoRepository })
  })

  it('aberta -> em_analise grava historico com statusAnterior aberta', async () => {
    const criada = await criar('aberta')

    const atualizada = await usecase.executar({
      id: criada.id,
      status: 'em_analise',
      observacao: 'Equipe de manutencao avisada',
      usuario: GESTOR
    })

    expect(atualizada.status).toBe('em_analise')

    const historico = await historicoRepository.listarPorOcorrencia(criada.id)

    expect(historico).toHaveLength(1)
    expect(historico[0].statusAnterior).toBe('aberta')
    expect(historico[0].statusNovo).toBe('em_analise')
    expect(historico[0].usuario.id).toBe('gestor-1')
    expect(historico[0].observacao).toBe('Equipe de manutencao avisada')
    expect(historico[0].data).toBeInstanceOf(Date)
  })

  it('aberta -> resolvida lanca TransicaoInvalidaError', async () => {
    const criada = await criar('aberta')

    await expect(
      usecase.executar({ id: criada.id, status: 'resolvida', usuario: GESTOR })
    ).rejects.toMatchObject({ name: 'TransicaoInvalidaError' })

    expect(await historicoRepository.listarPorOcorrencia(criada.id)).toHaveLength(0)
    expect((await ocorrenciaRepository.buscarPorId(criada.id)).status).toBe('aberta')
  })

  it('resolvida nao vai para lugar nenhum', async () => {
    const criada = await criar('resolvida')

    for (const status of Ocorrencia.STATUS) {
      await expect(
        usecase.executar({ id: criada.id, status, usuario: GESTOR })
      ).rejects.toMatchObject({ name: 'TransicaoInvalidaError' })
    }
  })

  it('solicitante tentando alterar lanca NaoAutorizadoError', async () => {
    const criada = await criar('aberta')

    await expect(
      usecase.executar({ id: criada.id, status: 'em_analise', usuario: SOLICITANTE })
    ).rejects.toMatchObject({ name: 'NaoAutorizadoError' })

    expect((await ocorrenciaRepository.buscarPorId(criada.id)).status).toBe('aberta')
  })

  it('transicao para resolvida preenche resolvidaEm', async () => {
    const criada = await criar('em_atendimento')

    const atualizada = await usecase.executar({
      id: criada.id,
      status: 'resolvida',
      usuario: GESTOR
    })

    expect(atualizada.status).toBe('resolvida')
    expect(atualizada.resolvidaEm).toBeInstanceOf(Date)
  })

  it('cancelamento e permitido a partir de qualquer status nao final', async () => {
    for (const status of ['aberta', 'em_analise', 'em_atendimento']) {
      const criada = await criar(status)

      const atualizada = await usecase.executar({
        id: criada.id,
        status: 'cancelada',
        usuario: GESTOR
      })

      expect(atualizada.status).toBe('cancelada')
    }
  })

  it('status fora do dominio e erro de validacao, nao de transicao', async () => {
    const criada = await criar('aberta')

    await expect(
      usecase.executar({ id: criada.id, status: 'arquivada', usuario: GESTOR })
    ).rejects.toMatchObject({ name: 'ValidacaoError' })
  })

  it('devolve 404 quando a ocorrencia nao existe', async () => {
    await expect(
      usecase.executar({ id: 'nao-existe', status: 'em_analise', usuario: GESTOR })
    ).rejects.toMatchObject({ name: 'NaoEncontradoError' })
  })

  it('desfaz a mudanca de status se o historico falhar', async () => {
    const criada = await criar('aberta')

    jest.spyOn(historicoRepository, 'registrar').mockRejectedValueOnce(new Error('banco fora'))

    await expect(
      usecase.executar({ id: criada.id, status: 'em_analise', usuario: GESTOR })
    ).rejects.toThrow('banco fora')

    expect((await ocorrenciaRepository.buscarPorId(criada.id)).status).toBe('aberta')
  })
})
