const ArmazenamentoImagem = require('../../src/application/ports/ArmazenamentoImagem')

// Substitui o Cloudinary nos testes. `falhar` simula o upload quebrado,
// que e o caso em que a ocorrencia nao pode ser criada.
class ArmazenamentoImagemFake extends ArmazenamentoImagem {
  constructor({ falhar = false } = {}) {
    super()
    this.falhar = falhar
    this.enviados = []
  }

  async enviar(arquivo) {
    if (this.falhar) {
      throw new Error('Cloudinary fora do ar')
    }

    this.enviados.push(arquivo)

    return `https://fake.cloudinary/${arquivo.originalname || 'imagem'}`
  }

  async remover() {}
}

module.exports = ArmazenamentoImagemFake
