import api from './api'

export async function listar({ categoria, status, prioridade, page, limit } = {}) {
  const { data } = await api.get('/ocorrencias', {
    params: { categoria, status, prioridade, page, limit }
  })
  return data
}

export async function obter(id) {
  const { data } = await api.get(`/ocorrencias/${id}`)
  return data
}

// Com imagem vai como multipart; sem imagem, JSON simples. O back aceita os dois.
export async function registrar({ titulo, descricao, categoria, localizacao, imagem }) {
  if (!imagem) {
    const { data } = await api.post('/ocorrencias', { titulo, descricao, categoria, localizacao })
    return data
  }

  const corpo = new FormData()

  corpo.append('titulo', titulo)
  corpo.append('descricao', descricao)
  corpo.append('categoria', categoria)
  corpo.append('localizacao', localizacao)
  corpo.append('imagem', imagem)

  const { data } = await api.post('/ocorrencias', corpo)
  return data
}

export async function alterarStatus(id, { status, observacao }) {
  const { data } = await api.patch(`/ocorrencias/${id}/status`, { status, observacao })
  return data
}

export async function alterarPrioridade(id, prioridade) {
  const { data } = await api.patch(`/ocorrencias/${id}/prioridade`, { prioridade })
  return data
}

export async function atribuirResponsavel(id, responsavelId) {
  const { data } = await api.patch(`/ocorrencias/${id}/responsavel`, { responsavelId })
  return data
}

export async function registrarSolucao(id, solucaoAplicada) {
  const { data } = await api.patch(`/ocorrencias/${id}/solucao`, { solucaoAplicada })
  return data
}

export async function avaliar(id, { nota, comentario }) {
  const { data } = await api.post(`/ocorrencias/${id}/avaliacao`, { nota, comentario })
  return data
}

export async function listarComentarios(id) {
  const { data } = await api.get(`/ocorrencias/${id}/comentarios`)
  return data
}

export async function comentar(id, texto) {
  const { data } = await api.post(`/ocorrencias/${id}/comentarios`, { texto })
  return data
}

export async function listarHistorico(id) {
  const { data } = await api.get(`/ocorrencias/${id}/historico`)
  return data
}
