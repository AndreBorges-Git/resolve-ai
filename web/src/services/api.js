import axios from 'axios'

export const CHAVE_TOKEN = 'resolveai:token'
export const CHAVE_USUARIO = 'resolveai:usuario'

// O AuthContext escuta este evento para derrubar a sessao. Passar por evento,
// e nao por window.location, mantem a navegacao dentro do React Router.
export const EVENTO_SESSAO_EXPIRADA = 'resolveai:sessao-expirada'

// Um 401 nestas rotas e credencial errada, nao sessao vencida: aqui o 401 e a
// resposta esperada e a tela precisa mostrar a mensagem, nao deslogar.
const ROTAS_DE_ENTRADA = ['/auth/login', '/auth/registrar']

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
})

// O token vive no localStorage e entra aqui, uma vez so: nenhuma tela precisa
// lembrar de montar o cabecalho Authorization.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(CHAVE_TOKEN)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// A API sempre responde erro como { erro: '...' }. Normalizamos aqui para que
// as telas tratem sempre uma Error com mensagem legivel em portugues.
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const mensagem =
      erro.response?.data?.erro || erro.response?.data?.mensagem || 'Não foi possível completar a operação'
    const normalizado = new Error(mensagem)

    normalizado.status = erro.response?.status ?? 0

    // Token vencido no meio da sessao: sem isto as telas so mostrariam erro e
    // o usuario ficaria preso numa aba que nao responde mais.
    const url = erro.config?.url || ''
    const ehRotaDeEntrada = ROTAS_DE_ENTRADA.some((rota) => url.includes(rota))

    if (normalizado.status === 401 && !ehRotaDeEntrada && localStorage.getItem(CHAVE_TOKEN)) {
      localStorage.removeItem(CHAVE_TOKEN)
      localStorage.removeItem(CHAVE_USUARIO)
      window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA))
    }

    return Promise.reject(normalizado)
  }
)

export default api
