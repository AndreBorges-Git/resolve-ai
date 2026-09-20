const DomainError = require('./DomainError')

class NaoAutorizadoError extends DomainError {
  constructor(mensagem = 'Perfil sem permissao para esta acao') {
    super(mensagem)
    this.name = 'NaoAutorizadoError'
  }
}

module.exports = NaoAutorizadoError
