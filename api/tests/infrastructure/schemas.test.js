const Ocorrencia = require('../../src/domain/entities/Ocorrencia')
const Comentario = require('../../src/infrastructure/database/mongoose/schemas/ComentarioSchema')
const HistoricoStatus = require('../../src/infrastructure/database/mongoose/schemas/HistoricoStatusSchema')
const OcorrenciaModel = require('../../src/infrastructure/database/mongoose/schemas/OcorrenciaSchema')
const Usuario = require('../../src/infrastructure/database/mongoose/schemas/UsuarioSchema')

// validate() roda o validador do Mongoose em memoria, sem conexao: da para
// conferir o contrato do schema mantendo a regra de testar sem banco.
const ID = '000000000000000000000001'

const OCORRENCIA_VALIDA = {
  titulo: 'Lampada queimada no corredor',
  descricao: 'O corredor do segundo andar esta sem iluminacao desde ontem.',
  categoria: 'iluminacao',
  localizacao: 'Bloco B, segundo andar',
  solicitante: ID
}

async function camposComErro(documento) {
  try {
    await documento.validate()
    return []
  } catch (erro) {
    return Object.keys(erro.errors).sort()
  }
}

describe('OcorrenciaSchema', () => {
  it('aceita ocorrencia completa e aplica os padroes de abertura', async () => {
    const documento = new OcorrenciaModel(OCORRENCIA_VALIDA)

    expect(await camposComErro(documento)).toEqual([])
    expect(documento.status).toBe('aberta')
    expect(documento.prioridade).toBe('media')
    expect(documento.resolvidaEm).toBeNull()
    expect(documento.avaliacao).toBeNull()
    expect(documento.imagemUrl).toBeNull()
  })

  it('cobra os campos obrigatorios', async () => {
    expect(await camposComErro(new OcorrenciaModel({}))).toEqual([
      'categoria',
      'descricao',
      'localizacao',
      'solicitante',
      'titulo'
    ])
  })

  // O banco nao pode aceitar valor que o dominio recusa: se as duas listas
  // divergirem, entra no Mongo um status que a maquina de estados nao conhece.
  it('os enums do banco sao exatamente os do dominio', async () => {
    const caminho = (campo) => OcorrenciaModel.schema.path(campo).enumValues

    expect(caminho('status')).toEqual(Ocorrencia.STATUS)
    expect(caminho('categoria')).toEqual(Ocorrencia.CATEGORIAS)
    expect(caminho('prioridade')).toEqual(Ocorrencia.PRIORIDADES)
  })

  it('recusa categoria e status fora da lista', async () => {
    const documento = new OcorrenciaModel({
      ...OCORRENCIA_VALIDA,
      categoria: 'astrologia',
      status: 'voando'
    })

    expect(await camposComErro(documento)).toEqual(['categoria', 'status'])
  })

  it('limita a nota da avaliacao a 1..5', async () => {
    const baixa = new OcorrenciaModel({ ...OCORRENCIA_VALIDA, avaliacao: { nota: 0 } })
    const alta = new OcorrenciaModel({ ...OCORRENCIA_VALIDA, avaliacao: { nota: 6 } })
    const certa = new OcorrenciaModel({ ...OCORRENCIA_VALIDA, avaliacao: { nota: 5 } })

    expect(await camposComErro(baixa)).toEqual(['avaliacao.nota'])
    expect(await camposComErro(alta)).toEqual(['avaliacao.nota'])
    expect(await camposComErro(certa)).toEqual([])
  })
})

describe('UsuarioSchema', () => {
  it('normaliza o e-mail em minusculas e nasce solicitante', async () => {
    const documento = new Usuario({
      nome: 'Ana Souza',
      email: '  ANA@Resolveai.com ',
      senha: 'hash'
    })

    expect(await camposComErro(documento)).toEqual([])
    expect(documento.email).toBe('ana@resolveai.com')
    expect(documento.perfil).toBe('solicitante')
  })

  it('so aceita os dois perfis', async () => {
    expect(Usuario.schema.path('perfil').enumValues).toEqual(['solicitante', 'gestor'])
  })

  // A senha nunca deve sair numa consulta comum: quem precisa dela pede explicito.
  it('nao devolve a senha por padrao', async () => {
    expect(Usuario.schema.path('senha').options.select).toBe(false)
  })
})

describe('HistoricoStatusSchema', () => {
  it('aceita o registro de abertura, que nao tem status anterior', async () => {
    const documento = new HistoricoStatus({
      ocorrencia: ID,
      statusAnterior: null,
      statusNovo: 'aberta',
      usuario: ID
    })

    expect(await camposComErro(documento)).toEqual([])
    expect(documento.data).toBeInstanceOf(Date)
  })

  it('exige ocorrencia, status novo e usuario — a trilha sem autor nao serve', async () => {
    expect(await camposComErro(new HistoricoStatus({}))).toEqual([
      'ocorrencia',
      'statusNovo',
      'usuario'
    ])
  })
})

describe('ComentarioSchema', () => {
  it('exige ocorrencia, autor e texto', async () => {
    expect(await camposComErro(new Comentario({}))).toEqual(['autor', 'ocorrencia', 'texto'])
  })

  it('aceita comentario completo', async () => {
    const documento = new Comentario({ ocorrencia: ID, autor: ID, texto: 'Ja passei no local' })

    expect(await camposComErro(documento)).toEqual([])
  })
})
