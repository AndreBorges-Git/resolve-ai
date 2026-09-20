const ListarOcorrencias = require('../../src/application/usecases/ListarOcorrencias')
const Ocorrencia = require('../../src/domain/entities/Ocorrencia')
const OcorrenciaRepositoryFake = require('../helpers/OcorrenciaRepositoryFake')

function ocorrenciaDe(solicitante, extras = {}) {
  return new Ocorrencia({
    titulo: 'Vazamento na copa',
    descricao: 'Agua acumulando embaixo da pia da copa do terreo.',
    categoria: 'vazamento',
    localizacao: 'Terreo',
    solicitante,
    ...extras
  })
}

describe('ListarOcorrencias', () => {
  let ocorrenciaRepository
  let usecase

  beforeEach(async () => {
    ocorrenciaRepository = new OcorrenciaRepositoryFake()
    usecase = new ListarOcorrencias({ ocorrenciaRepository })

    await ocorrenciaRepository.salvar(ocorrenciaDe('usuario-1'))
    await ocorrenciaRepository.salvar(ocorrenciaDe('usuario-1', { status: 'resolvida' }))
    await ocorrenciaRepository.salvar(ocorrenciaDe('usuario-2', { categoria: 'limpeza' }))
  })

  it('solicitante enxerga apenas as proprias ocorrencias', async () => {
    const resultado = await usecase.executar({
      usuario: { id: 'usuario-1', perfil: 'solicitante' }
    })

    expect(resultado.total).toBe(2)
    expect(resultado.itens.every((item) => item.solicitante.id === 'usuario-1')).toBe(true)
  })

  it('gestor enxerga todas', async () => {
    const resultado = await usecase.executar({ usuario: { id: 'gestor-1', perfil: 'gestor' } })

    expect(resultado.total).toBe(3)
  })

  it('filtra por status dentro do escopo do solicitante', async () => {
    const resultado = await usecase.executar({
      usuario: { id: 'usuario-1', perfil: 'solicitante' },
      filtros: { status: 'resolvida' }
    })

    expect(resultado.total).toBe(1)
    expect(resultado.itens[0].status).toBe('resolvida')
  })

  it('recusa filtro com valor fora do dominio', async () => {
    await expect(
      usecase.executar({
        usuario: { id: 'gestor-1', perfil: 'gestor' },
        filtros: { status: 'arquivada' }
      })
    ).rejects.toMatchObject({ name: 'ValidacaoError' })
  })

  it('pagina o resultado', async () => {
    const resultado = await usecase.executar({
      usuario: { id: 'gestor-1', perfil: 'gestor' },
      paginacao: { page: 2, limit: 2 }
    })

    expect(resultado.itens).toHaveLength(1)
    expect(resultado.total).toBe(3)
    expect(resultado.paginas).toBe(2)
  })
})
