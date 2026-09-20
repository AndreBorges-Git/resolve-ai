const AutenticarUsuario = require('../../src/application/usecases/AutenticarUsuario')
const RegistrarUsuario = require('../../src/application/usecases/RegistrarUsuario')
const HasherFake = require('../helpers/HasherFake')
const TokenServiceFake = require('../helpers/TokenServiceFake')
const UsuarioRepositoryFake = require('../helpers/UsuarioRepositoryFake')

async function montarComUsuario() {
  const usuarioRepository = new UsuarioRepositoryFake()
  const hasher = new HasherFake()
  const tokenService = new TokenServiceFake()

  const registrarUsuario = new RegistrarUsuario({ usuarioRepository, hasher, tokenService })
  await registrarUsuario.executar({
    nome: 'Carlos Lima',
    email: 'carlos@resolveai.com',
    senha: 'Senha123',
    perfil: 'gestor'
  })

  return {
    autenticarUsuario: new AutenticarUsuario({ usuarioRepository, hasher, tokenService })
  }
}

describe('AutenticarUsuario', () => {
  it('autentica com credenciais corretas e devolve token e perfil', async () => {
    const { autenticarUsuario } = await montarComUsuario()

    const { token, usuario } = await autenticarUsuario.executar({
      email: 'carlos@resolveai.com',
      senha: 'Senha123'
    })

    expect(token).toBeTruthy()
    expect(usuario.perfil).toBe('gestor')
    expect(usuario.senha).toBeUndefined()
  })

  it('aceita e-mail com caixa diferente da cadastrada', async () => {
    const { autenticarUsuario } = await montarComUsuario()

    const { token } = await autenticarUsuario.executar({
      email: 'CARLOS@resolveai.com',
      senha: 'Senha123'
    })

    expect(token).toBeTruthy()
  })

  it('recusa senha errada com NaoAutenticadoError', async () => {
    const { autenticarUsuario } = await montarComUsuario()

    await expect(
      autenticarUsuario.executar({ email: 'carlos@resolveai.com', senha: 'errada' })
    ).rejects.toMatchObject({ name: 'NaoAutenticadoError' })
  })

  it('recusa e-mail inexistente com a mesma mensagem da senha errada', async () => {
    const { autenticarUsuario } = await montarComUsuario()

    const senhaErrada = await autenticarUsuario
      .executar({ email: 'carlos@resolveai.com', senha: 'errada' })
      .catch((erro) => erro)
    const emailInexistente = await autenticarUsuario
      .executar({ email: 'ninguem@resolveai.com', senha: 'Senha123' })
      .catch((erro) => erro)

    expect(emailInexistente.name).toBe('NaoAutenticadoError')
    expect(emailInexistente.message).toBe(senhaErrada.message)
  })
})
