const AlterarPrioridade = require('../../src/application/usecases/AlterarPrioridade')
const AtribuirResponsavel = require('../../src/application/usecases/AtribuirResponsavel')
const ObterIndicadores = require('../../src/application/usecases/ObterIndicadores')
const RegistrarSolucao = require('../../src/application/usecases/RegistrarSolucao')
const Ocorrencia = require('../../src/domain/entities/Ocorrencia')
const OcorrenciaRepositoryFake = require('../helpers/OcorrenciaRepositoryFake')
const UsuarioRepositoryFake = require('../helpers/UsuarioRepositoryFake')

const GESTOR = { id: 'gestor-1', perfil: 'gestor' }
const SOLICITANTE = { id: 'usuario-1', perfil: 'solicitante' }

describe('acoes do gestor', () => {
  let ocorrenciaRepository
  let usuarioRepository
  let ocorrencia

  async function criar(extras = {}) {
    return ocorrenciaRepository.salvar(
      new Ocorrencia({
        titulo: 'Lampada queimada no corredor',
        descricao: 'O corredor do segundo andar esta sem iluminacao desde ontem.',
        categoria: 'iluminacao',
        localizacao: 'Bloco B',
        solicitante: SOLICITANTE.id,
        ...extras
      })
    )
  }

  beforeEach(async () => {
    ocorrenciaRepository = new OcorrenciaRepositoryFake()
    usuarioRepository = new UsuarioRepositoryFake()
    ocorrencia = await criar()
  })

  describe('AlterarPrioridade', () => {
    it('gestor altera', async () => {
      const usecase = new AlterarPrioridade({ ocorrenciaRepository })

      const atualizada = await usecase.executar({
        id: ocorrencia.id,
        prioridade: 'alta',
        usuario: GESTOR
      })

      expect(atualizada.prioridade).toBe('alta')
    })

    it('solicitante nao altera', async () => {
      const usecase = new AlterarPrioridade({ ocorrenciaRepository })

      await expect(
        usecase.executar({ id: ocorrencia.id, prioridade: 'alta', usuario: SOLICITANTE })
      ).rejects.toMatchObject({ name: 'NaoAutorizadoError' })
    })

    it('prioridade fora do dominio e 400', async () => {
      const usecase = new AlterarPrioridade({ ocorrenciaRepository })

      await expect(
        usecase.executar({ id: ocorrencia.id, prioridade: 'urgentissima', usuario: GESTOR })
      ).rejects.toMatchObject({ name: 'ValidacaoError' })
    })
  })

  describe('AtribuirResponsavel', () => {
    it('aceita responsavel com perfil gestor', async () => {
      const gestor = await usuarioRepository.salvar({
        nome: 'Gi',
        email: 'gi@resolveai.com',
        senha: 'hash',
        perfil: 'gestor'
      })
      const usecase = new AtribuirResponsavel({ ocorrenciaRepository, usuarioRepository })

      const atualizada = await usecase.executar({
        id: ocorrencia.id,
        responsavelId: gestor.id,
        usuario: GESTOR
      })

      expect(atualizada.responsavel).toBe(gestor.id)
    })

    it('recusa responsavel que nao e gestor', async () => {
      const solicitante = await usuarioRepository.salvar({
        nome: 'Ana',
        email: 'ana@resolveai.com',
        senha: 'hash',
        perfil: 'solicitante'
      })
      const usecase = new AtribuirResponsavel({ ocorrenciaRepository, usuarioRepository })

      await expect(
        usecase.executar({ id: ocorrencia.id, responsavelId: solicitante.id, usuario: GESTOR })
      ).rejects.toMatchObject({ name: 'ValidacaoError' })
    })

    it('responsavel inexistente e 404', async () => {
      const usecase = new AtribuirResponsavel({ ocorrenciaRepository, usuarioRepository })

      await expect(
        usecase.executar({ id: ocorrencia.id, responsavelId: 'nao-existe', usuario: GESTOR })
      ).rejects.toMatchObject({ name: 'NaoEncontradoError' })
    })
  })

  describe('RegistrarSolucao', () => {
    it('gestor registra a solucao sem mexer no status', async () => {
      const usecase = new RegistrarSolucao({ ocorrenciaRepository })

      const atualizada = await usecase.executar({
        id: ocorrencia.id,
        solucaoAplicada: 'Lampada trocada e reator revisado.',
        usuario: GESTOR
      })

      expect(atualizada.solucaoAplicada).toBe('Lampada trocada e reator revisado.')
      expect(atualizada.status).toBe('aberta')
    })

    it('solucao vazia e 400', async () => {
      const usecase = new RegistrarSolucao({ ocorrenciaRepository })

      await expect(
        usecase.executar({ id: ocorrencia.id, solucaoAplicada: '  ', usuario: GESTOR })
      ).rejects.toMatchObject({ name: 'ValidacaoError' })
    })
  })

  describe('ObterIndicadores', () => {
    it('so gestor acessa', async () => {
      const usecase = new ObterIndicadores({ ocorrenciaRepository })

      await expect(usecase.executar({ usuario: SOLICITANTE })).rejects.toMatchObject({
        name: 'NaoAutorizadoError'
      })
    })

    it('devolve todas as chaves, inclusive as zeradas', async () => {
      const usecase = new ObterIndicadores({ ocorrenciaRepository })

      const indicadores = await usecase.executar({ usuario: GESTOR })

      expect(indicadores.total).toBe(1)
      expect(Object.keys(indicadores.porStatus)).toEqual(Ocorrencia.STATUS)
      expect(indicadores.porStatus.aberta).toBe(1)
      expect(indicadores.porStatus.resolvida).toBe(0)
      expect(Object.keys(indicadores.porCategoria)).toEqual(Ocorrencia.CATEGORIAS)
      expect(indicadores.tempoMedioResolucaoHoras).toBeNull()
      expect(indicadores.avaliacaoMedia).toBeNull()
    })

    it('calcula tempo medio de resolucao e nota media', async () => {
      const usecase = new ObterIndicadores({ ocorrenciaRepository })

      const resolvida = await criar({ status: 'resolvida' })
      await ocorrenciaRepository.atualizar(resolvida.id, {
        resolvidaEm: new Date(resolvida.createdAt.getTime() + 3 * 60 * 60 * 1000),
        avaliacao: { nota: 4, comentario: null, data: new Date() }
      })

      const indicadores = await usecase.executar({ usuario: GESTOR })

      expect(indicadores.total).toBe(2)
      expect(indicadores.tempoMedioResolucaoHoras).toBe(3)
      expect(indicadores.avaliacaoMedia).toBe(4)
    })
  })
})
