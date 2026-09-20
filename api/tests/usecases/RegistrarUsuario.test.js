const RegistrarUsuario = require('../../src/application/usecases/RegistrarUsuario')
const HasherFake = require('../helpers/HasherFake')
const TokenServiceFake = require('../helpers/TokenServiceFake')
const UsuarioRepositoryFake = require('../helpers/UsuarioRepositoryFake')

function montar() {
  const usuarioRepository = new UsuarioRepositoryFake()
  const hasher = new HasherFake()
  const tokenService = new TokenServiceFake()

  return {
    usuarioRepository,
    registrarUsuario: new RegistrarUsuario({ usuarioRepository, hasher, tokenService })
  }
}

const dadosValidos = {
  nome: 'Ana Souza',
  email: 'ana@resolveai.com',
  senha: 'Senha123',
  perfil: 'solicitante'
}

describe('RegistrarUsuario', () => {
  it('registra o usuario, devolve token e nunca devolve a senha', async () => {
    const { registrarUsuario } = montar()

    const { token, usuario } = await registrarUsuario.executar(dadosValidos)

    expect(token).toBeTruthy()
    expect(usuario.id).toBeTruthy()
    expect(usuario.nome).toBe('Ana Souza')
    expect(usuario.perfil).toBe('solicitante')
    expect(usuario.senha).toBeUndefined()
  })

  it('grava a senha hasheada, nunca em texto plano', async () => {
    const { registrarUsuario, usuarioRepository } = montar()

    await registrarUsuario.executar(dadosValidos)
    const gravado = await usuarioRepository.buscarPorEmailComSenha('ana@resolveai.com')

    expect(gravado.senha).not.toBe('Senha123')
    expect(gravado.senha).toBe('hash:Senha123')
  })

  it('normaliza o e-mail para minusculas', async () => {
    const { registrarUsuario } = montar()

    const { usuario } = await registrarUsuario.executar({
      ...dadosValidos,
      email: '  ANA@ResolveAi.com  '
    })

    expect(usuario.email).toBe('ana@resolveai.com')
  })

  it('rejeita e-mail duplicado com ValidacaoError', async () => {
    const { registrarUsuario } = montar()

    await registrarUsuario.executar(dadosValidos)

    await expect(registrarUsuario.executar(dadosValidos)).rejects.toMatchObject({
      name: 'ValidacaoError'
    })
  })

  it('rejeita senha curta com ValidacaoError', async () => {
    const { registrarUsuario } = montar()

    await expect(
      registrarUsuario.executar({ ...dadosValidos, senha: '123' })
    ).rejects.toMatchObject({ name: 'ValidacaoError' })
  })

  it('rejeita perfil fora do enum com ValidacaoError', async () => {
    const { registrarUsuario } = montar()

    await expect(
      registrarUsuario.executar({ ...dadosValidos, perfil: 'administrador' })
    ).rejects.toMatchObject({ name: 'ValidacaoError' })
  })
})
