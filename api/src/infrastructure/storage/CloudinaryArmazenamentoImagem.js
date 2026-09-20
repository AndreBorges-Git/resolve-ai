const { v2: cloudinary } = require('cloudinary')

const ArmazenamentoImagem = require('../../application/ports/ArmazenamentoImagem')

// O container de producao nao tem disco persistente: imagem gravada em disco
// some no proximo deploy. Por isso o upload vai sempre para o Cloudinary.
class CloudinaryArmazenamentoImagem extends ArmazenamentoImagem {
  constructor({ cloudName, apiKey, apiSecret, pasta = 'resolve-ai' } = {}) {
    super()

    this.pasta = pasta
    this.configurado = Boolean(cloudName && apiKey && apiSecret)

    if (this.configurado) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
      })
    }
  }

  async enviar(arquivo) {
    if (!arquivo || !arquivo.buffer) {
      return null
    }

    if (!this.configurado) {
      throw new Error('Cloudinary não configurado: defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET')
    }

    // upload_stream para enviar o buffer do multer sem tocar em disco.
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: this.pasta, resource_type: 'image' },
        (erro, resultado) => {
          if (erro) {
            return reject(erro)
          }

          return resolve(resultado.secure_url)
        }
      )

      stream.end(arquivo.buffer)
    })
  }

  async remover(identificador) {
    if (!this.configurado || !identificador) {
      return
    }

    await cloudinary.uploader.destroy(identificador)
  }
}

module.exports = CloudinaryArmazenamentoImagem
