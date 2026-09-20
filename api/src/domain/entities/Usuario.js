const ValidacaoError = require('../errors/ValidacaoError')

const PERFIS = ['solicitante', 'gestor']
const TAMANHO_MINIMO_SENHA = 6

// Entidade pura: sem mongoose, sem bcrypt. A senha que chega aqui ja e hash.
class Usuario {
  constructor({ id = null, nome, email, senha, perfil = 'solicitante', createdAt = null }) {
    if (!nome || !String(nome).trim()) {
      throw new ValidacaoError('Nome e obrigatorio')
    }

    if (!email || !String(email).trim()) {
      throw new ValidacaoError('E-mail e obrigatorio')
    }

    if (!Usuario.ehEmailValido(email)) {
      throw new ValidacaoError('E-mail invalido')
    }

    if (!PERFIS.includes(perfil)) {
      throw new ValidacaoError(`Perfil deve ser um de: ${PERFIS.join(', ')}`)
    }

    this.id = id
    this.nome = String(nome).trim()
    this.email = Usuario.normalizarEmail(email)
    this.senha = senha
    this.perfil = perfil
    this.createdAt = createdAt
  }

  static get PERFIS() {
    return [...PERFIS]
  }

  static normalizarEmail(email) {
    return String(email).trim().toLowerCase()
  }

  static ehEmailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
  }

  // A senha em texto plano nunca entra na entidade; a regra de forca mora aqui
  // porque e regra de negocio, nao detalhe de infraestrutura.
  static validarSenhaEmTextoPlano(senha) {
    if (!senha || String(senha).length < TAMANHO_MINIMO_SENHA) {
      throw new ValidacaoError(`Senha deve ter ao menos ${TAMANHO_MINIMO_SENHA} caracteres`)
    }
  }

  ehGestor() {
    return this.perfil === 'gestor'
  }

  ehSolicitante() {
    return this.perfil === 'solicitante'
  }

  // Representacao segura para devolver na API: nunca inclui a senha.
  paraJSON() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      perfil: this.perfil,
      createdAt: this.createdAt
    }
  }
}

module.exports = Usuario
