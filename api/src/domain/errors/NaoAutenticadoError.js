const DomainError = require('./DomainError')

class NaoAutenticadoError extends DomainError {
  constructor(mensagem = 'Credenciais invalidas') {
    super(mensagem)
    this.name = 'NaoAutenticadoError'
  }
}

module.exports = NaoAutenticadoError
