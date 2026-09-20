const Ocorrencia = require('../../domain/entities/Ocorrencia')
const { ValidacaoError } = require('../../domain/errors')

const LIMITE_PADRAO = 10
const LIMITE_MAXIMO = 50

function validarOpcao(valor, permitidos, campo) {
  if (valor === undefined || valor === null || valor === '') {
    return undefined
  }

  if (!permitidos.includes(valor)) {
    throw new ValidacaoError(`${campo} invalido. Use: ${permitidos.join(', ')}`)
  }

  return valor
}

function numeroPositivo(valor, padrao, maximo) {
  const numero = Number.parseInt(valor, 10)

  if (Number.isNaN(numero) || numero < 1) {
    return padrao
  }

  return maximo ? Math.min(numero, maximo) : numero
}

// Autorizacao de leitura: solicitante so enxerga as proprias ocorrencias.
// O escopo e aplicado aqui, no filtro, nunca depois de buscar tudo.
class ListarOcorrencias {
  constructor({ ocorrenciaRepository }) {
    this.ocorrenciaRepository = ocorrenciaRepository
  }

  async executar({ usuario, filtros = {}, paginacao = {} }) {
    const escopo = {
      categoria: validarOpcao(filtros.categoria, Ocorrencia.CATEGORIAS, 'categoria'),
      status: validarOpcao(filtros.status, Ocorrencia.STATUS, 'status'),
      prioridade: validarOpcao(filtros.prioridade, Ocorrencia.PRIORIDADES, 'prioridade')
    }

    if (usuario.perfil !== 'gestor') {
      escopo.solicitante = usuario.id
    }

    return this.ocorrenciaRepository.listar(escopo, {
      page: numeroPositivo(paginacao.page, 1),
      limit: numeroPositivo(paginacao.limit, LIMITE_PADRAO, LIMITE_MAXIMO)
    })
  }
}

module.exports = ListarOcorrencias
