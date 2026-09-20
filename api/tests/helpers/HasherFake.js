const Hasher = require('../../src/application/ports/Hasher')

// Hash previsivel: o teste consegue afirmar que a senha foi hasheada
// sem pagar o custo do bcrypt.
class HasherFake extends Hasher {
  async gerarHash(senhaEmTextoPlano) {
    return `hash:${senhaEmTextoPlano}`
  }

  async comparar(senhaEmTextoPlano, hash) {
    return hash === `hash:${senhaEmTextoPlano}`
  }
}

module.exports = HasherFake
