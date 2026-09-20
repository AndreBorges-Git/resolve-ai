const DomainError = require('./DomainError')

class TransicaoInvalidaError extends DomainError {
  constructor(mensagem) {
    super(mensagem)
    this.name = 'TransicaoInvalidaError'
  }
}

module.exports = TransicaoInvalidaError
