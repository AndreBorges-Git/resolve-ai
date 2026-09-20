// Base de todo erro de negocio. O errorHandler traduz cada name em um status HTTP.
class DomainError extends Error {
  constructor(mensagem) {
    super(mensagem)
    this.name = 'DomainError'
  }
}

module.exports = DomainError
