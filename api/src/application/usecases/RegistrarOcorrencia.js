const Ocorrencia = require('../../domain/entities/Ocorrencia')

// Ponto critico da auditoria: a ocorrencia nasce com status 'aberta' E com o
// primeiro registro do historico (statusAnterior null) gravado aqui dentro.
// Nunca em rota separada, nunca no front.
class RegistrarOcorrencia {
  constructor({ ocorrenciaRepository, historicoRepository, armazenamentoImagem }) {
    this.ocorrenciaRepository = ocorrenciaRepository
    this.historicoRepository = historicoRepository
    this.armazenamentoImagem = armazenamentoImagem
  }

  async executar({ dados = {}, arquivo = null, usuario }) {
    // O upload vem antes de qualquer escrita no banco: se o Cloudinary falhar,
    // a excecao sobe e nenhuma ocorrencia e criada.
    const imagemUrl = arquivo ? await this.armazenamentoImagem.enviar(arquivo) : null

    const ocorrencia = new Ocorrencia({
      titulo: dados.titulo,
      descricao: dados.descricao,
      categoria: dados.categoria,
      localizacao: dados.localizacao,
      imagemUrl,
      status: Ocorrencia.STATUS_INICIAL,
      solicitante: usuario.id
    })

    const salva = await this.ocorrenciaRepository.salvar(ocorrencia)

    try {
      await this.historicoRepository.registrar({
        ocorrencia: salva.id,
        statusAnterior: null,
        statusNovo: salva.status,
        usuario: usuario.id,
        observacao: 'Ocorrência registrada'
      })
    } catch (erro) {
      // Ocorrencia sem trilha de auditoria nao pode existir: desfaz.
      await this.ocorrenciaRepository.remover(salva.id)
      throw erro
    }

    return salva
  }
}

module.exports = RegistrarOcorrencia
