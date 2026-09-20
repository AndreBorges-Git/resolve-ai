// Paleta, espacamentos e tipografia em um lugar so. Os componentes leem daqui
// pelo ThemeProvider; nenhuma cor literal espalhada pelas telas.
const tema = {
  cores: {
    fundo: '#f5f7fa',
    superficie: '#ffffff',
    borda: '#dfe4ec',
    texto: '#1f2933',
    textoFraco: '#6b7787',
    primaria: '#1f4f8f',
    primariaEscura: '#173b6d',
    perigo: '#b23a3a',
    sucesso: '#2f7a4d'
  },
  // Cada status tem um par fundo/texto para os badges e a timeline.
  status: {
    aberta: { fundo: '#e6eefb', texto: '#1f4f8f' },
    em_analise: { fundo: '#fdf0da', texto: '#8a5a12' },
    em_atendimento: { fundo: '#e7e2fb', texto: '#4b3a9e' },
    resolvida: { fundo: '#e2f3e8', texto: '#2f7a4d' },
    cancelada: { fundo: '#f0f1f3', texto: '#6b7787' }
  },
  prioridades: {
    baixa: { fundo: '#eef1f5', texto: '#6b7787' },
    media: { fundo: '#fdf0da', texto: '#8a5a12' },
    alta: { fundo: '#fbe6e6', texto: '#b23a3a' }
  },
  espaco: (n) => `${n * 4}px`,
  raio: '8px',
  sombra: '0 1px 3px rgba(31, 41, 51, 0.08)',
  fonte: {
    pequena: '13px',
    normal: '15px',
    titulo: '20px',
    destaque: '28px'
  },
  larguraMaxima: '960px'
}

export default tema
