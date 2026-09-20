import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }

  body {
    margin: 0;
    min-height: 100vh;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    font-size: ${({ theme }) => theme.fonte.normal};
    line-height: 1.5;
    color: ${({ theme }) => theme.cores.texto};
    background: ${({ theme }) => theme.cores.fundo};
  }

  a { color: ${({ theme }) => theme.cores.primaria}; }

  h1, h2, h3 { line-height: 1.25; }
`

export default GlobalStyle
