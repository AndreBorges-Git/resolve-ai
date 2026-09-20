const multer = require('multer')

const TAMANHO_MAXIMO = 5 * 1024 * 1024
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Memoria, nao disco: o buffer vai direto para o Cloudinary e o container
// de producao nao precisa de volume nenhum.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAXIMO },
  fileFilter: (req, arquivo, callback) => {
    if (!TIPOS_ACEITOS.includes(arquivo.mimetype)) {
      const erro = new Error('Formato de imagem inválido. Use JPEG, PNG, WEBP ou GIF')
      erro.name = 'ValidacaoError'
      return callback(erro)
    }

    return callback(null, true)
  }
})

// Traduz o erro do multer para o formato que o errorHandler entende,
// para o cliente receber 400 e nao 500.
function imagemOpcional(campo = 'imagem') {
  const middleware = upload.single(campo)

  return (req, res, next) => {
    middleware(req, res, (erro) => {
      if (!erro) {
        return next()
      }

      if (erro.code === 'LIMIT_FILE_SIZE') {
        erro.message = 'Imagem maior que 5MB'
      }

      erro.name = 'ValidacaoError'

      return next(erro)
    })
  }
}

module.exports = imagemOpcional
