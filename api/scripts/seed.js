// Seed de demonstracao.
//
// Popula o banco com um cenario coerente para o video do MVP e para a banca:
// dois perfis, as cinco situacoes da maquina de estados, uma ocorrencia com a
// trilha de auditoria completa das quatro transicoes e datas espalhadas por
// dias, para que o tempo medio de resolucao do dashboard signifique alguma coisa.
//
// E um script de infraestrutura: fala direto com os schemas Mongoose de
// proposito. Os casos de uso carimbam a data de agora, e aqui precisamos
// escrever no passado. Nenhuma regra de negocio e reimplementada — as
// transicoes abaixo respeitam a mesma maquina de estados do dominio, e o
// script valida isso antes de gravar.
//
//   node scripts/seed.js
//
// Idempotente: limpa as quatro colecoes antes de recriar tudo.

require('dotenv').config()

const mongoose = require('mongoose')

const Ocorrencia = require('../src/domain/entities/Ocorrencia')
const BcryptHasher = require('../src/infrastructure/security/BcryptHasher')
const { conectar, desconectar } = require('../src/infrastructure/config/db')
const ComentarioModel = require('../src/infrastructure/database/mongoose/schemas/ComentarioSchema')
const HistoricoModel = require('../src/infrastructure/database/mongoose/schemas/HistoricoStatusSchema')
const OcorrenciaModel = require('../src/infrastructure/database/mongoose/schemas/OcorrenciaSchema')
const UsuarioModel = require('../src/infrastructure/database/mongoose/schemas/UsuarioSchema')

const SENHA_PADRAO = 'Senha123'

const USUARIOS = [
  { chave: 'gestor', nome: 'Carla Mendes', email: 'gestor@resolveai.com', perfil: 'gestor' },
  { chave: 'marina', nome: 'Marina Alves', email: 'marina@resolveai.com', perfil: 'solicitante' },
  { chave: 'joao', nome: 'João Pereira', email: 'joao@resolveai.com', perfil: 'solicitante' }
]

// Cada cenario descreve a ocorrencia como ela nasceu e o caminho que percorreu.
// `diasAtras` e contado para tras a partir de agora; `horas` conta a partir da
// abertura daquela ocorrencia. Os textos vao acentuados: sao o que a banca le
// na tela, nao identificador de codigo.
const CENARIOS = [
  {
    titulo: 'Vazamento de água na calçada da Rua Aurora',
    descricao:
      'Água corre há três dias na calçada em frente ao número 45. A rua já está escorregadia e ' +
      'duas pessoas quase caíram no fim da tarde.',
    categoria: 'vazamento',
    localizacao: 'Rua Aurora, 45 — perto da padaria',
    solicitante: 'marina',
    prioridade: 'alta',
    responsavel: 'gestor',
    diasAtras: 12,
    transicoes: [
      { status: 'em_analise', horas: 3, observacao: 'Equipe de campo acionada para vistoriar o vazamento.' },
      { status: 'em_atendimento', horas: 27, observacao: 'Equipe no local isolando o trecho e trocando o registro.' },
      { status: 'resolvida', horas: 52, observacao: 'Vazamento estancado e calçada liberada.' }
    ],
    solucaoAplicada:
      'Registro de passagem substituído e trecho de 4 metros da tubulação trocado. Calçada recomposta.',
    avaliacao: {
      nota: 5,
      comentario: 'Resolveram rápido e ainda avisaram quando terminaram. Ótimo atendimento.',
      horas: 60
    },
    comentarios: [
      { autor: 'marina', horas: 2, texto: 'Consigo enviar mais fotos se ajudar.' },
      { autor: 'gestor', horas: 4, texto: 'Obrigada, Marina. Já temos o suficiente, a equipe sai hoje.' },
      { autor: 'marina', horas: 54, texto: 'Passei agora e está tudo seco. Obrigada!' }
    ]
  },
  {
    titulo: 'Poste apagado na esquina da Praça Central',
    descricao:
      'O poste da esquina não acende há duas semanas. O ponto de ônibus fica no escuro e as ' +
      'pessoas esperam na rua por medo.',
    categoria: 'iluminacao',
    localizacao: 'Praça Central, esquina com a Rua das Flores',
    solicitante: 'joao',
    prioridade: 'alta',
    responsavel: 'gestor',
    diasAtras: 9,
    transicoes: [
      { status: 'em_analise', horas: 5, observacao: 'Ordem de serviço aberta junto à concessionária.' },
      { status: 'em_atendimento', horas: 30, observacao: 'Caminhão com cesta agendado para a manhã seguinte.' },
      { status: 'resolvida', horas: 49, observacao: 'Reator e lâmpada trocados; ponto testado à noite.' }
    ],
    solucaoAplicada: 'Reator queimado substituído e lâmpada de LED instalada no lugar da antiga.',
    avaliacao: { nota: 4, comentario: 'Demorou um pouco para começar, mas ficou ótimo.', horas: 56 },
    comentarios: [
      { autor: 'joao', horas: 28, texto: 'Alguma previsão? A semana toda no escuro complica.' },
      { autor: 'gestor', horas: 31, texto: 'Cesta agendada para amanhã de manhã, João.' }
    ]
  },
  {
    titulo: 'Playground com balanço quebrado',
    descricao:
      'A corrente de um dos balanços arrebentou e a tábua ficou pendurada. Há risco para as ' +
      'crianças que usam o parquinho no fim da tarde.',
    categoria: 'equipamento',
    localizacao: 'Parque das Acácias — área infantil',
    solicitante: 'marina',
    prioridade: 'alta',
    responsavel: 'gestor',
    diasAtras: 4,
    transicoes: [
      { status: 'em_analise', horas: 2, observacao: 'Área isolada com fita enquanto avaliamos a estrutura.' },
      { status: 'em_atendimento', horas: 20, observacao: 'Peças de reposição pedidas ao fornecedor.' }
    ],
    comentarios: [{ autor: 'marina', horas: 3, texto: 'Obrigada por isolar tão rápido.' }]
  },
  {
    titulo: 'Entulho acumulado ao lado do contêiner de lixo',
    descricao:
      'Restos de obra e móveis velhos estão acumulados ao lado do contêiner há mais de uma ' +
      'semana. Já apareceram ratos.',
    categoria: 'limpeza',
    localizacao: 'Rua Bento Freitas, altura do número 300',
    solicitante: 'joao',
    prioridade: 'media',
    responsavel: 'gestor',
    diasAtras: 3,
    transicoes: [
      { status: 'em_analise', horas: 6, observacao: 'Coleta especial solicitada para o próximo roteiro.' },
      { status: 'em_atendimento', horas: 26, observacao: 'Caminhão de entulho a caminho.' }
    ]
  },
  {
    titulo: 'Rampa de acesso sem corrimão na entrada lateral',
    descricao:
      'A rampa da entrada lateral não tem corrimão dos dois lados. Quem usa cadeira ou bengala ' +
      'não consegue subir com segurança.',
    categoria: 'acessibilidade',
    localizacao: 'Centro comunitário — entrada lateral',
    solicitante: 'marina',
    prioridade: 'media',
    responsavel: 'gestor',
    diasAtras: 2,
    transicoes: [{ status: 'em_analise', horas: 4, observacao: 'Medições agendadas com a equipe de obras.' }]
  },
  {
    titulo: 'Portão da garagem coletiva não trava',
    descricao:
      'A fechadura elétrica do portão parou de travar. Qualquer pessoa empurra e entra na ' +
      'garagem, inclusive à noite.',
    categoria: 'seguranca',
    localizacao: 'Bloco B — garagem coletiva',
    solicitante: 'joao',
    prioridade: 'alta',
    diasAtras: 1,
    transicoes: []
  },
  {
    titulo: 'Infiltração no teto do corredor do segundo andar',
    descricao:
      'Mancha de umidade crescendo no teto do corredor, com pingos quando chove forte. A ' +
      'pintura já está descascando.',
    categoria: 'manutencao',
    localizacao: 'Segundo andar — corredor central',
    solicitante: 'marina',
    prioridade: 'media',
    diasAtras: 1,
    transicoes: []
  },
  {
    titulo: 'Barulho de obra fora do horário permitido',
    descricao:
      'A obra do prédio vizinho começou a usar marteletes antes das 7h. Registrei aqui sem ' +
      'saber se era o canal certo.',
    categoria: 'outros',
    localizacao: 'Rua das Palmeiras, 120',
    solicitante: 'joao',
    prioridade: 'baixa',
    responsavel: 'gestor',
    diasAtras: 6,
    transicoes: [
      { status: 'em_analise', horas: 8, observacao: 'Verificando se o caso é da nossa alçada.' },
      {
        status: 'cancelada',
        horas: 30,
        observacao:
          'Assunto é da fiscalização de posturas do município. Solicitante orientado pelo canal correto.'
      }
    ],
    comentarios: [
      { autor: 'gestor', horas: 30, texto: 'João, encaminhei o contato da fiscalização no seu e-mail.' }
    ]
  }
]

const HORA = 1000 * 60 * 60
const DIA = HORA * 24

function agoraMenosDias(dias) {
  return new Date(Date.now() - dias * DIA)
}

function somarHoras(data, horas) {
  return new Date(data.getTime() + horas * HORA)
}

// Erra cedo e alto: um cenario com transicao invalida seria um seed que mente
// sobre a propria maquina de estados.
function validarCenario(cenario) {
  let status = Ocorrencia.STATUS_INICIAL

  for (const transicao of cenario.transicoes) {
    const transicoesPossiveis = Ocorrencia.TRANSICOES[status] || []

    if (!transicoesPossiveis.includes(transicao.status)) {
      throw new Error(
        `Cenario "${cenario.titulo}": transicao invalida de '${status}' para '${transicao.status}'`
      )
    }

    status = transicao.status
  }

  if (cenario.avaliacao && status !== 'resolvida') {
    throw new Error(`Cenario "${cenario.titulo}": so ocorrencia resolvida pode ter avaliacao`)
  }

  return status
}

// Mongoose carimba createdAt/updatedAt no insert e descarta qualquer tentativa
// de sobrescrever createdAt num update — inclusive com `timestamps: false`.
// Para o seed contar uma historia de dias atras, escrevemos pelo driver cru.
async function reescreverTimestamps(Model, id, { createdAt, updatedAt }) {
  await Model.collection.updateOne({ _id: id }, { $set: { createdAt, updatedAt } })
}

async function criarUsuarios() {
  const hasher = new BcryptHasher()
  const senhaHash = await hasher.gerarHash(SENHA_PADRAO)

  const criados = await UsuarioModel.create(
    USUARIOS.map(({ nome, email, perfil }) => ({ nome, email, senha: senhaHash, perfil }))
  )

  return USUARIOS.reduce(
    (mapa, usuario, indice) => ({ ...mapa, [usuario.chave]: criados[indice] }),
    {}
  )
}

async function criarOcorrencia(cenario, usuarios) {
  const statusFinal = validarCenario(cenario)
  const abertaEm = agoraMenosDias(cenario.diasAtras)
  const solicitante = usuarios[cenario.solicitante]

  const transicaoResolvida = cenario.transicoes.find((t) => t.status === 'resolvida')
  const ultimaTransicao = cenario.transicoes[cenario.transicoes.length - 1]
  const atualizadaEm = ultimaTransicao ? somarHoras(abertaEm, ultimaTransicao.horas) : abertaEm

  const documento = await OcorrenciaModel.create({
    titulo: cenario.titulo,
    descricao: cenario.descricao,
    categoria: cenario.categoria,
    localizacao: cenario.localizacao,
    prioridade: cenario.prioridade,
    status: statusFinal,
    solicitante: solicitante._id,
    responsavel: cenario.responsavel ? usuarios[cenario.responsavel]._id : null,
    solucaoAplicada: cenario.solucaoAplicada || null,
    avaliacao: cenario.avaliacao
      ? {
          nota: cenario.avaliacao.nota,
          comentario: cenario.avaliacao.comentario,
          data: somarHoras(abertaEm, cenario.avaliacao.horas)
        }
      : null,
    resolvidaEm: transicaoResolvida ? somarHoras(abertaEm, transicaoResolvida.horas) : null
  })

  await reescreverTimestamps(OcorrenciaModel, documento._id, {
    createdAt: abertaEm,
    updatedAt: atualizadaEm
  })

  // O registro de abertura, com statusAnterior null, e o mesmo que
  // RegistrarOcorrencia grava em producao.
  const historico = [
    {
      ocorrencia: documento._id,
      statusAnterior: null,
      statusNovo: Ocorrencia.STATUS_INICIAL,
      usuario: solicitante._id,
      observacao: 'Ocorrência registrada',
      data: abertaEm
    }
  ]

  let statusAnterior = Ocorrencia.STATUS_INICIAL

  for (const transicao of cenario.transicoes) {
    historico.push({
      ocorrencia: documento._id,
      statusAnterior,
      statusNovo: transicao.status,
      usuario: usuarios.gestor._id,
      observacao: transicao.observacao || null,
      data: somarHoras(abertaEm, transicao.horas)
    })

    statusAnterior = transicao.status
  }

  await HistoricoModel.create(historico)

  if (cenario.comentarios && cenario.comentarios.length) {
    await ComentarioModel.create(
      cenario.comentarios.map((comentario) => ({
        ocorrencia: documento._id,
        autor: usuarios[comentario.autor]._id,
        texto: comentario.texto,
        data: somarHoras(abertaEm, comentario.horas)
      }))
    )
  }

  return { status: statusFinal, transicoes: historico.length }
}

async function executar() {
  const uri = process.env.MONGODB_URI

  await conectar(uri)

  console.log(`Banco: ${mongoose.connection.name} em ${mongoose.connection.host}`)
  console.log('Limpando usuarios, ocorrencias, historico e comentarios...')

  await Promise.all([
    UsuarioModel.deleteMany({}),
    OcorrenciaModel.deleteMany({}),
    HistoricoModel.deleteMany({}),
    ComentarioModel.deleteMany({})
  ])

  const usuarios = await criarUsuarios()

  console.log(`${USUARIOS.length} usuarios criados (senha de todos: ${SENHA_PADRAO})`)

  const porStatus = {}

  for (const cenario of CENARIOS) {
    const { status, transicoes } = await criarOcorrencia(cenario, usuarios)

    porStatus[status] = (porStatus[status] || 0) + 1

    console.log(`  [${status.padEnd(14)}] ${cenario.titulo} (${transicoes} registros de historico)`)
  }

  console.log(`\n${CENARIOS.length} ocorrencias criadas:`)

  for (const status of Ocorrencia.STATUS) {
    console.log(`  ${status.padEnd(14)} ${porStatus[status] || 0}`)
  }

  console.log('\nEntre como gestor@resolveai.com para ver o painel e o dashboard.')

  await desconectar()
}

executar().catch(async (erro) => {
  console.error('Seed falhou:', erro.message)

  await desconectar().catch(() => {})

  process.exit(1)
})
