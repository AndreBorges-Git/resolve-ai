const DomainError = require('./DomainError')

class NaoAutorizadoError extends DomainError {
  constructor(mensagem = 'Perfil sem permissão para esta ação') {
    super(mensagem)
    this.name = 'NaoAutorizadoError'
  }
}

module.exports = NaoAutorizadoError
