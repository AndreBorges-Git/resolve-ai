// Traduz erro de dominio em status HTTP. E o unico lugar que faz essa traducao.
// O mapa usa o name do erro para nao acoplar a camada HTTP ao domain.
const STATUS_POR_ERRO = {
  ValidacaoError: 400,
  NaoAutenticadoError: 401,
  NaoAutorizadoError: 403,
  NaoEncontradoError: 404,
  TransicaoInvalidaError: 409
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = STATUS_POR_ERRO[err.name] || err.status || 500
  const emProducao = process.env.NODE_ENV === 'production'

  if (status === 500 && !emProducao) {
    console.error(err)
  }

  res.status(status).json({
    erro: status === 500 && emProducao ? 'Erro interno do servidor' : err.message
  })
}

module.exports = errorHandler
