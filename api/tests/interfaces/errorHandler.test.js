const errorHandler = require('../../src/interfaces/http/middlewares/errorHandler')

function respostaFalsa() {
  return {
    statusRecebido: null,
    corpoRecebido: null,
    status(codigo) {
      this.statusRecebido = codigo
      return this
    },
    json(corpo) {
      this.corpoRecebido = corpo
      return this
    }
  }
}

const REQUISICAO = { method: 'GET', originalUrl: '/api/ocorrencias' }

describe('traducao de erro de dominio em status HTTP', () => {
  let logado

  beforeEach(() => {
    logado = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    logado.mockRestore()
    delete process.env.NODE_ENV
  })

  it.each([
    ['ValidacaoError', 400],
    ['NaoAutenticadoError', 401],
    ['NaoAutorizadoError', 403],
    ['NaoEncontradoError', 404],
    ['TransicaoInvalidaError', 409]
  ])('%s vira %i e devolve a mensagem do dominio', (nome, esperado) => {
    const erro = new Error('mensagem do dominio')
    erro.name = nome

    const res = respostaFalsa()
    errorHandler(erro, REQUISICAO, res, () => {})

    expect(res.statusRecebido).toBe(esperado)
    expect(res.corpoRecebido).toEqual({ erro: 'mensagem do dominio' })
    expect(logado).not.toHaveBeenCalled()
  })

  it('erro desconhecido vira 500', () => {
    const res = respostaFalsa()
    errorHandler(new Error('quebrou'), REQUISICAO, res, () => {})

    expect(res.statusRecebido).toBe(500)
  })

  // Em producao o cliente recebe mensagem generica, mas o log tem de existir:
  // e o unico rastro de um 500 no ambiente que nao da para reproduzir.
  it('em producao esconde o detalhe do cliente e ainda assim registra no log', () => {
    process.env.NODE_ENV = 'production'

    const res = respostaFalsa()
    errorHandler(new Error('detalhe interno'), REQUISICAO, res, () => {})

    expect(res.statusRecebido).toBe(500)
    expect(res.corpoRecebido).toEqual({ erro: 'Erro interno do servidor' })
    expect(logado).toHaveBeenCalledTimes(1)
    expect(logado.mock.calls[0][0]).toContain('GET /api/ocorrencias')
  })

  it('fora de producao entrega a mensagem real para facilitar o desenvolvimento', () => {
    const res = respostaFalsa()
    errorHandler(new Error('detalhe interno'), REQUISICAO, res, () => {})

    expect(res.corpoRecebido).toEqual({ erro: 'detalhe interno' })
    expect(logado).toHaveBeenCalledTimes(1)
  })
})
