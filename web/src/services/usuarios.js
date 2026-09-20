import api from './api'

export async function listar({ perfil } = {}) {
  const { data } = await api.get('/usuarios', { params: { perfil } })
  return data
}
