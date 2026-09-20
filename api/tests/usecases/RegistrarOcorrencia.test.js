const RegistrarOcorrencia = require('../../src/application/usecases/RegistrarOcorrencia')
const ArmazenamentoImagemFake = require('../helpers/ArmazenamentoImagemFake')
const HistoricoRepositoryFake = require('../helpers/HistoricoRepositoryFake')
const OcorrenciaRepositoryFake = require('../helpers/OcorrenciaRepositoryFake')

const SOLICITANTE = { id: 'usuario-1', perfil: 'solicitante' }

const DADOS = {
  titulo: 'Lampada queimada no corredor',
  descricao: 'O corredor do segundo andar esta sem iluminacao desde ontem.',
  categoria: 'iluminacao',
  localizacao: 'Bloco B, segundo andar'
}

function montar({ armazenamentoImagem = new ArmazenamentoImagemFake() } = {}) {
  const ocorrenciaRepository = new OcorrenciaRepositoryFake()
  const historicoRepository = new HistoricoRepositoryFake()

  return {
    ocorrenciaRepository,
    historicoRepository,
    armazenamentoImagem,
    usecase: new RegistrarOcorrencia({
      ocorrenciaRepository,
      historicoRepository,
      armazenamentoImagem
    })
  }
}

describe('RegistrarOcorrencia', () => {
  it('cria a ocorrencia com status aberta e vinculada ao solicitante', async () => {
    const { usecase } = montar()

    const ocorrencia = await usecase.executar({ dados: DADOS, usuario: SOLICITANTE })

    expect(ocorrencia.id).toBeDefined()
    expect(ocorrencia.status).toBe('aberta')
    expect(ocorrencia.prioridade).toBe('media')
    expect(ocorrencia.solicitante.id).toBe('usuario-1')
  })

  it('grava o historico de abertura com statusAnterior null na mesma operacao', async () => {
    const { usecase, historicoRepository } = montar()

    const ocorrencia = await usecase.executar({ dados: DADOS, usuario: SOLICITANTE })
    const historico = await historicoRepository.listarPorOcorrencia(ocorrencia.id)

    expect(historico).toHaveLength(1)
    expect(historico[0].statusAnterior).toBeNull()
    expect(historico[0].statusNovo).toBe('aberta')
    expect(historico[0].usuario.id).toBe('usuario-1')
  })

  it('envia a imagem para o armazenamento e guarda a URL', async () => {
    const { usecase, armazenamentoImagem } = montar()

    const ocorrencia = await usecase.executar({
      dados: DADOS,
      arquivo: { buffer: Buffer.from('imagem'), originalname: 'foto.png', mimetype: 'image/png' },
      usuario: SOLICITANTE
    })

    expect(armazenamentoImagem.enviados).toHaveLength(1)
    expect(ocorrencia.imagemUrl).toBe('https://fake.cloudinary/foto.png')
  })

  it('nao cria a ocorrencia se o upload falhar', async () => {
    const { usecase, ocorrenciaRepository, historicoRepository } = montar({
      armazenamentoImagem: new ArmazenamentoImagemFake({ falhar: true })
    })

    await expect(
      usecase.executar({
        dados: DADOS,
        arquivo: { buffer: Buffer.from('imagem'), originalname: 'foto.png' },
        usuario: SOLICITANTE
      })
    ).rejects.toThrow('Cloudinary fora do ar')

    expect(ocorrenciaRepository.itens).toHaveLength(0)
    expect(historicoRepository.itens).toHaveLength(0)
  })

  it('desfaz a ocorrencia se o historico de abertura falhar', async () => {
    const { usecase, ocorrenciaRepository, historicoRepository } = montar()

    jest.spyOn(historicoRepository, 'registrar').mockRejectedValueOnce(new Error('banco fora'))

    await expect(usecase.executar({ dados: DADOS, usuario: SOLICITANTE })).rejects.toThrow('banco fora')

    expect(ocorrenciaRepository.itens).toHaveLength(0)
  })

  it('recusa payload invalido antes de tocar no banco', async () => {
    const { usecase, ocorrenciaRepository } = montar()

    await expect(
      usecase.executar({ dados: { ...DADOS, categoria: 'inexistente' }, usuario: SOLICITANTE })
    ).rejects.toMatchObject({ name: 'ValidacaoError' })

    expect(ocorrenciaRepository.itens).toHaveLength(0)
  })
})
