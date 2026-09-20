// Contrato de upload. Implementado por Cloudinary em producao;
// trocar por S3 significaria criar outro adaptador e mudar uma linha do container.
class ArmazenamentoImagem {
  // Recebe { buffer, mimetype, originalname } e devolve a URL publica.
  async enviar(arquivo) {
    throw new Error('nao implementado')
  }

  async remover(identificador) {
    throw new Error('nao implementado')
  }
}

module.exports = ArmazenamentoImagem
