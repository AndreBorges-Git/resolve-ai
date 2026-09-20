const TransicaoInvalidaError = require('../errors/TransicaoInvalidaError')
const ValidacaoError = require('../errors/ValidacaoError')

const STATUS = ['aberta', 'em_analise', 'em_atendimento', 'resolvida', 'cancelada']
const CATEGORIAS = [
  'iluminacao',
  'equipamento',
  'acessibilidade',
  'limpeza',
  'vazamento',
  'seguranca',
  'manutencao',
  'outros'
]
const PRIORIDADES = ['baixa', 'media', 'alta']

// A maquina de estados do enunciado. Fica no dominio porque e regra de negocio:
// nem o controller nem o caso de uso decidem o que pode virar o que.
//
//   aberta -> em_analise -> em_atendimento -> resolvida
//      |          |               |
//      +----------+---------------+--> cancelada
//
// 'resolvida' e 'cancelada' sao finais.
const TRANSICOES = {
  aberta: ['em_analise', 'cancelada'],
  em_analise: ['em_atendimento', 'cancelada'],
  em_atendimento: ['resolvida', 'cancelada'],
  resolvida: [],
  cancelada: []
}

// Entidade pura: nenhuma lib externa.
class Ocorrencia {
  constructor({
    id = null,
    titulo,
    descricao,
    categoria,
    localizacao,
    imagemUrl = null,
    prioridade = 'media',
    status = 'aberta',
    solicitante,
    responsavel = null,
    solucaoAplicada = null,
    avaliacao = null,
    resolvidaEm = null,
    createdAt = null,
    updatedAt = null
  }) {
    if (!titulo || !String(titulo).trim()) {
      throw new ValidacaoError('Título é obrigatório')
    }

    if (!descricao || !String(descricao).trim()) {
      throw new ValidacaoError('Descrição é obrigatória')
    }

    if (!CATEGORIAS.includes(categoria)) {
      throw new ValidacaoError(`Categoria deve ser uma de: ${CATEGORIAS.join(', ')}`)
    }

    if (!localizacao || !String(localizacao).trim()) {
      throw new ValidacaoError('Localização é obrigatória')
    }

    if (!PRIORIDADES.includes(prioridade)) {
      throw new ValidacaoError(`Prioridade deve ser uma de: ${PRIORIDADES.join(', ')}`)
    }

    if (!STATUS.includes(status)) {
      throw new ValidacaoError(`Status deve ser um de: ${STATUS.join(', ')}`)
    }

    if (!solicitante) {
      throw new ValidacaoError('Solicitante é obrigatório')
    }

    this.id = id
    this.titulo = String(titulo).trim()
    this.descricao = String(descricao).trim()
    this.categoria = categoria
    this.localizacao = String(localizacao).trim()
    this.imagemUrl = imagemUrl
    this.prioridade = prioridade
    this.status = status
    this.solicitante = solicitante
    this.responsavel = responsavel
    this.solucaoAplicada = solucaoAplicada
    this.avaliacao = avaliacao
    this.resolvidaEm = resolvidaEm
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  static get STATUS() {
    return [...STATUS]
  }

  // Toda ocorrencia nasce aberta. O nome fica no dominio para que nenhum
  // caso de uso precise repetir a string.
  static get STATUS_INICIAL() {
    return 'aberta'
  }

  static get CATEGORIAS() {
    return [...CATEGORIAS]
  }

  static get PRIORIDADES() {
    return [...PRIORIDADES]
  }

  static get TRANSICOES() {
    return { ...TRANSICOES }
  }

  static ehStatusFinal(status) {
    return (TRANSICOES[status] || []).length === 0
  }

  // Para quais status esta ocorrencia pode ir a partir de onde esta.
  proximosStatus() {
    return [...(TRANSICOES[this.status] || [])]
  }

  podeTransicionarPara(novoStatus) {
    return this.proximosStatus().includes(novoStatus)
  }

  // Unico caminho para mudar o status de uma ocorrencia.
  alterarStatus(novoStatus) {
    if (!STATUS.includes(novoStatus)) {
      throw new ValidacaoError(`status inválido. Use: ${STATUS.join(', ')}`)
    }

    if (!this.podeTransicionarPara(novoStatus)) {
      throw new TransicaoInvalidaError(
        `Não é possível mudar de '${this.status}' para '${novoStatus}'`
      )
    }

    const statusAnterior = this.status

    this.status = novoStatus
    this.resolvidaEm = novoStatus === 'resolvida' ? new Date() : this.resolvidaEm

    return statusAnterior
  }

  // Id do solicitante, seja ele um id cru ou um objeto ja populado.
  get solicitanteId() {
    return Ocorrencia.extrairId(this.solicitante)
  }

  static extrairId(valor) {
    if (!valor) {
      return null
    }

    return String(valor.id || valor._id || valor)
  }

  pertenceA(usuarioId) {
    return this.solicitanteId === String(usuarioId)
  }

  // Solicitante so enxerga as proprias; gestor enxerga todas.
  podeSerVistaPor({ id, perfil }) {
    return perfil === 'gestor' || this.pertenceA(id)
  }
}

module.exports = Ocorrencia
