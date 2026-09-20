import api from './api'

export async function registrar({ nome, email, senha, perfil }) {
  const { data } = await api.post('/auth/registrar', { nome, email, senha, perfil })
  return data
}

export async function login({ email, senha }) {
  const { data } = await api.post('/auth/login', { email, senha })
  return data
}

export async function obterUsuarioAutenticado() {
  const { data } = await api.get('/auth/eu')
  return data
}
