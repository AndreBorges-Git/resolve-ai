const fs = require('fs')
const os = require('os')
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

// Aceita as tres formas de citar o modulo — 'x', "x" e `x` — e tambem o import
// ESM. Um guarda que so entende aspas simples nao e guarda: bastaria escrever
// require("mongoose") no dominio para passar por ele.
const PADRAO_IMPORTACAO = /(?:require\s*\(\s*|(?:import|from)\s+)(['"`])([^'"`]+)\1/g

function requiresDe(arquivo) {
  const conteudo = fs.readFileSync(arquivo, 'utf8')

  return [...conteudo.matchAll(PADRAO_IMPORTACAO)].map((achado) => achado[2])
}

// 'mongoose/lib/algo' conta como mongoose: senao o subcaminho seria uma porta
// de entrada para a lib proibida.
function pacoteRaiz(dependencia) {
  if (dependencia.startsWith('@')) {
    return dependencia.split('/').slice(0, 2).join('/')
  }

  return dependencia.split('/')[0]
}

// A regra de dependencia da Clean Architecture deixa de ser combinado verbal
// e passa a ser teste: se alguem importar mongoose no dominio, o pipeline quebra.
describe('regra de dependencia', () => {
  it.each(['domain', 'application'])('%s nao importa lib externa', (camada) => {
    const violacoes = arquivosDe(path.join(RAIZ, camada)).flatMap((arquivo) =>
      requiresDe(arquivo)
        .filter((dependencia) => LIBS_PROIBIDAS.includes(pacoteRaiz(dependencia)))
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

  // O guarda tambem precisa ser guardado: se o leitor de importacoes deixar de
  // enxergar uma forma de escrever require, os testes acima continuam verdes
  // enquanto a regra ja estaria furada.
  it('o proprio leitor de importacoes enxerga as tres formas de citar o modulo', () => {
    const temporario = path.join(os.tmpdir(), `resolveai-guarda-${process.pid}.js`)

    fs.writeFileSync(
      temporario,
      [
        "const a = require('mongoose')",
        'const b = require("express")',
        'const c = require(`bcryptjs`)',
        "const d = require('mongoose/lib/connection')",
        "const e = require('../domain/entities/Ocorrencia')"
      ].join('\n')
    )

    try {
      const proibidas = requiresDe(temporario).filter((dependencia) =>
        LIBS_PROIBIDAS.includes(pacoteRaiz(dependencia))
      )

      expect(proibidas).toEqual(['mongoose', 'express', 'bcryptjs', 'mongoose/lib/connection'])
    } finally {
      fs.unlinkSync(temporario)
    }
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
