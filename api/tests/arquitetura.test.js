const fs = require('fs')
const path = require('path')

const RAIZ = path.join(__dirname, '..', 'src')
const LIBS_PROIBIDAS = ['express', 'mongoose', 'jsonwebtoken', 'bcryptjs', 'cloudinary', 'multer']

function arquivosDe(diretorio) {
  return fs.readdirSync(diretorio, { withFileTypes: true }).flatMap((item) => {
    const caminho = path.join(diretorio, item.name)

    if (item.isDirectory()) {
      return arquivosDe(caminho)
    }

    return item.name.endsWith('.js') ? [caminho] : []
  })
}

function requiresDe(arquivo) {
  const conteudo = fs.readFileSync(arquivo, 'utf8')

  return [...conteudo.matchAll(/require\('([^']+)'\)/g)].map((achado) => achado[1])
}

// A regra de dependencia da Clean Architecture deixa de ser combinado verbal
// e passa a ser teste: se alguem importar mongoose no dominio, o pipeline quebra.
describe('regra de dependencia', () => {
  it.each(['domain', 'application'])('%s nao importa lib externa', (camada) => {
    const violacoes = arquivosDe(path.join(RAIZ, camada)).flatMap((arquivo) =>
      requiresDe(arquivo)
        .filter((dependencia) => LIBS_PROIBIDAS.includes(dependencia))
        .map((dependencia) => `${path.relative(RAIZ, arquivo)} importa ${dependencia}`)
    )

    expect(violacoes).toEqual([])
  })

  it.each(['domain', 'application'])('%s nao importa camada de fora', (camada) => {
    const violacoes = arquivosDe(path.join(RAIZ, camada)).flatMap((arquivo) =>
      requiresDe(arquivo)
        .filter((dependencia) => /(^|\/)(infrastructure|interfaces|main)\//.test(dependencia))
        .map((dependencia) => `${path.relative(RAIZ, arquivo)} importa ${dependencia}`)
    )

    expect(violacoes).toEqual([])
  })

  it('domain nao conhece nem os casos de uso', () => {
    const violacoes = arquivosDe(path.join(RAIZ, 'domain')).flatMap((arquivo) =>
      requiresDe(arquivo)
        .filter((dependencia) => dependencia.includes('application/'))
        .map((dependencia) => `${path.relative(RAIZ, arquivo)} importa ${dependencia}`)
    )

    expect(violacoes).toEqual([])
  })
})
