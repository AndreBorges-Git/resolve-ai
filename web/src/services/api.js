import axios from 'axios'

export const CHAVE_TOKEN = 'resolveai:token'
export const CHAVE_USUARIO = 'resolveai:usuario'

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
      erro.response?.data?.erro || erro.response?.data?.mensagem || 'Nao foi possivel completar a operacao'
    const normalizado = new Error(mensagem)

    normalizado.status = erro.response?.status ?? 0
    return Promise.reject(normalizado)
  }
)

export default api
