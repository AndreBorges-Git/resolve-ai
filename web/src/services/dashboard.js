import api from './api'

export async function obterIndicadores() {
  const { data } = await api.get('/dashboard')
  return data
}
