// A lib e mockada: a suite inteira roda sem rede, e o que esta sob teste e o
// nosso adaptador — quando envia, quando recusa e o que devolve.
jest.mock('cloudinary', () => {
  const uploadStream = jest.fn()
  const destroy = jest.fn().mockResolvedValue({ result: 'ok' })
  const config = jest.fn()

  return { v2: { config, uploader: { upload_stream: uploadStream, destroy } } }
})

const { v2: cloudinary } = require('cloudinary')

const CloudinaryArmazenamentoImagem = require('../../src/infrastructure/storage/CloudinaryArmazenamentoImagem')

const CREDENCIAIS = { cloudName: 'nuvem', apiKey: 'chave', apiSecret: 'segredo' }

// Imita o upload_stream do Cloudinary: devolve um stream cujo end() dispara o
// callback, que e como a lib entrega o resultado de verdade.
function simularUpload({ erro = null, resultado = { secure_url: 'https://res.cloudinary.com/nuvem/foto.jpg' } } = {}) {
  cloudinary.uploader.upload_stream.mockImplementation((opcoes, callback) => ({
    end: () => callback(erro, resultado)
  }))
}

describe('CloudinaryArmazenamentoImagem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('configura a lib quando recebe as tres credenciais', () => {
    new CloudinaryArmazenamentoImagem(CREDENCIAIS)

    expect(cloudinary.config).toHaveBeenCalledWith({
      cloud_name: 'nuvem',
      api_key: 'chave',
      api_secret: 'segredo'
    })
  })

  it('nao configura a lib com credencial faltando', () => {
    new CloudinaryArmazenamentoImagem({ cloudName: 'nuvem' })

    expect(cloudinary.config).not.toHaveBeenCalled()
  })

  it('devolve a URL publica do upload', async () => {
    simularUpload()
    const armazenamento = new CloudinaryArmazenamentoImagem(CREDENCIAIS)

    const url = await armazenamento.enviar({ buffer: Buffer.from('imagem') })

    expect(url).toBe('https://res.cloudinary.com/nuvem/foto.jpg')
  })

  it('manda para a pasta configurada e como imagem', async () => {
    simularUpload()
    const armazenamento = new CloudinaryArmazenamentoImagem({ ...CREDENCIAIS, pasta: 'outra' })

    await armazenamento.enviar({ buffer: Buffer.from('imagem') })

    expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
      { folder: 'outra', resource_type: 'image' },
      expect.any(Function)
    )
  })

  // Imagem e opcional na ocorrencia: sem arquivo o caso de uso segue sem URL.
  it('sem arquivo devolve null sem chamar a lib', async () => {
    const armazenamento = new CloudinaryArmazenamentoImagem(CREDENCIAIS)

    expect(await armazenamento.enviar(null)).toBeNull()
    expect(await armazenamento.enviar({})).toBeNull()
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled()
  })

  // Falhar alto e melhor que gravar em disco: o container nao tem volume.
  it('sem credenciais, enviar estoura avisando quais variaveis faltam', async () => {
    const armazenamento = new CloudinaryArmazenamentoImagem()

    await expect(armazenamento.enviar({ buffer: Buffer.from('imagem') })).rejects.toThrow(
      /CLOUDINARY_CLOUD_NAME/
    )
  })

  it('propaga o erro do Cloudinary em vez de devolver URL invalida', async () => {
    simularUpload({ erro: new Error('cota estourada'), resultado: null })
    const armazenamento = new CloudinaryArmazenamentoImagem(CREDENCIAIS)

    await expect(armazenamento.enviar({ buffer: Buffer.from('imagem') })).rejects.toThrow(
      'cota estourada'
    )
  })

  it('remover chama destroy com o identificador', async () => {
    const armazenamento = new CloudinaryArmazenamentoImagem(CREDENCIAIS)

    await armazenamento.remover('resolve-ai/foto')

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('resolve-ai/foto')
  })

  it('remover sem identificador ou sem configuracao nao chama a lib', async () => {
    await new CloudinaryArmazenamentoImagem(CREDENCIAIS).remover(null)
    await new CloudinaryArmazenamentoImagem().remover('resolve-ai/foto')

    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled()
  })
})
