const DomainError = require('./DomainError')

class NaoEncontradoError extends DomainError {
  constructor(mensagem = 'Recurso não encontrado') {
    super(mensagem)
    this.name = 'NaoEncontradoError'
  }
}

module.exports = NaoEncontradoError
