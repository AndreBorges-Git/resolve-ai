const bcrypt = require('bcryptjs')

const Hasher = require('../../application/ports/Hasher')

class BcryptHasher extends Hasher {
  constructor(rodadas = 10) {
    super()
    this.rodadas = rodadas
  }

  async gerarHash(senhaEmTextoPlano) {
    return bcrypt.hash(senhaEmTextoPlano, this.rodadas)
  }

  async comparar(senhaEmTextoPlano, hash) {
    if (!hash) {
      return false
    }

    return bcrypt.compare(senhaEmTextoPlano, hash)
  }
}

module.exports = BcryptHasher
