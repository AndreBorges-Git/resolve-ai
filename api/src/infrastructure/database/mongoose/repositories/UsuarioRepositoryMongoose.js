const UsuarioRepository = require('../../../../application/ports/UsuarioRepository')
const ValidacaoError = require('../../../../domain/errors/ValidacaoError')
const UsuarioModel = require('../schemas/UsuarioSchema')

// Devolve objetos simples, nunca documentos Mongoose: e o que impede a lib
// de vazar para as camadas de dentro.
function paraObjeto(documento, { comSenha = false } = {}) {
  if (!documento) {
    return null
  }

  const objeto = {
    id: documento._id.toString(),
    nome: documento.nome,
    email: documento.email,
    perfil: documento.perfil,
    createdAt: documento.createdAt
  }

  if (comSenha) {
    objeto.senha = documento.senha
  }

  return objeto
}

class UsuarioRepositoryMongoose extends UsuarioRepository {
  async salvar(usuario) {
    try {
      const documento = await UsuarioModel.create({
        nome: usuario.nome,
        email: usuario.email,
        senha: usuario.senha,
        perfil: usuario.perfil
      })

      return paraObjeto(documento)
    } catch (erro) {
      // Corrida entre duas requisicoes com o mesmo e-mail: o indice unico
      // pega o que a checagem do caso de uso deixou passar.
      if (erro.code === 11000) {
        throw new ValidacaoError('E-mail já cadastrado')
      }

      throw erro
    }
  }

  async buscarPorId(id) {
    if (!id) {
      return null
    }

    const documento = await UsuarioModel.findById(id)

    return paraObjeto(documento)
  }

  async buscarPorEmail(email) {
    const documento = await UsuarioModel.findOne({ email })

    return paraObjeto(documento)
  }

  async buscarPorEmailComSenha(email) {
    const documento = await UsuarioModel.findOne({ email }).select('+senha')

    return paraObjeto(documento, { comSenha: true })
  }

  async listar({ perfil } = {}) {
    const filtro = perfil ? { perfil } : {}
    const documentos = await UsuarioModel.find(filtro).sort({ nome: 1 })

    return documentos.map((documento) => paraObjeto(documento))
  }
}

module.exports = UsuarioRepositoryMongoose
