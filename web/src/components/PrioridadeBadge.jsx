import styled from 'styled-components'

import { ROTULO_PRIORIDADE } from '../constants/ocorrencia'

const Etiqueta = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: ${({ theme }) => theme.fonte.pequena};
  font-weight: 600;
  white-space: nowrap;
  background: ${({ theme, $prioridade }) =>
    (theme.prioridades[$prioridade] || theme.prioridades.baixa).fundo};
  color: ${({ theme, $prioridade }) =>
    (theme.prioridades[$prioridade] || theme.prioridades.baixa).texto};
`

function PrioridadeBadge({ prioridade }) {
  return <Etiqueta $prioridade={prioridade}>{ROTULO_PRIORIDADE[prioridade] || prioridade}</Etiqueta>
}

export default PrioridadeBadge
