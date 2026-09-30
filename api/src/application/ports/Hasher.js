class Hasher {
  async gerarHash(senhaEmTextoPlano) {
    throw new Error('não implementado')
  }

  async comparar(senhaEmTextoPlano, hash) {
    throw new Error('não implementado')
  }
}

module.exports = Hasher
