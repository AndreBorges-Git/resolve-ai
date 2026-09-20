// Espelho dos enums do dominio. O rotulo com acento mora aqui; o valor enviado
// a API e sempre o mesmo texto sem acento que a entidade valida.
export const STATUS = [
  { valor: 'aberta', rotulo: 'Aberta' },
  { valor: 'em_analise', rotulo: 'Em análise' },
  { valor: 'em_atendimento', rotulo: 'Em atendimento' },
  { valor: 'resolvida', rotulo: 'Resolvida' },
  { valor: 'cancelada', rotulo: 'Cancelada' }
]

export const CATEGORIAS = [
  { valor: 'iluminacao', rotulo: 'Iluminação' },
  { valor: 'vazamento', rotulo: 'Vazamento' },
  { valor: 'limpeza', rotulo: 'Limpeza' },
  { valor: 'seguranca', rotulo: 'Segurança' },
  { valor: 'manutencao', rotulo: 'Manutenção' },
  { valor: 'equipamento', rotulo: 'Equipamento' },
  { valor: 'acessibilidade', rotulo: 'Acessibilidade' },
  { valor: 'outros', rotulo: 'Outros' }
]

export const PRIORIDADES = [
  { valor: 'baixa', rotulo: 'Baixa' },
  { valor: 'media', rotulo: 'Média' },
  { valor: 'alta', rotulo: 'Alta' }
]

function criarRotulos(lista) {
  return lista.reduce((mapa, item) => ({ ...mapa, [item.valor]: item.rotulo }), {})
}

export const ROTULO_STATUS = criarRotulos(STATUS)
export const ROTULO_CATEGORIA = criarRotulos(CATEGORIAS)
export const ROTULO_PRIORIDADE = criarRotulos(PRIORIDADES)

export function formatarData(valor) {
  if (!valor) return '—'

  return new Date(valor).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatarDataHora(valor) {
  if (!valor) return '—'

  return new Date(valor).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
