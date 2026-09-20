import styled from 'styled-components'

import { ROTULO_STATUS } from '../constants/ocorrencia'

const Etiqueta = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: ${({ theme }) => theme.fonte.pequena};
  font-weight: 600;
  white-space: nowrap;
  background: ${({ theme, $status }) => (theme.status[$status] || theme.status.cancelada).fundo};
  color: ${({ theme, $status }) => (theme.status[$status] || theme.status.cancelada).texto};
`

function StatusBadge({ status }) {
  return <Etiqueta $status={status}>{ROTULO_STATUS[status] || status}</Etiqueta>
}

export default StatusBadge
