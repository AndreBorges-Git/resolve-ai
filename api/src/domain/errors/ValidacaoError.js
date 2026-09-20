const DomainError = require('./DomainError')

class ValidacaoError extends DomainError {
  constructor(mensagem) {
    super(mensagem)
    this.name = 'ValidacaoError'
  }
}

module.exports = ValidacaoError
