import styled from 'styled-components'

import { ROTULO_CATEGORIA } from '../constants/ocorrencia'

const Etiqueta = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: ${({ theme }) => theme.fonte.pequena};
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  color: ${({ theme }) => theme.cores.textoFraco};
  background: ${({ theme }) => theme.cores.fundo};
`

function CategoriaBadge({ categoria }) {
  return <Etiqueta>{ROTULO_CATEGORIA[categoria] || categoria}</Etiqueta>
}

export default CategoriaBadge
