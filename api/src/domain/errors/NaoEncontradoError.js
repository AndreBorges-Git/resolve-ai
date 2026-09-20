const DomainError = require('./DomainError')

class NaoEncontradoError extends DomainError {
  constructor(mensagem = 'Recurso nao encontrado') {
    super(mensagem)
    this.name = 'NaoEncontradoError'
  }
}

module.exports = NaoEncontradoError
