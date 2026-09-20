import { Link } from 'react-router-dom'
import styled from 'styled-components'

import CategoriaBadge from './CategoriaBadge'
import PrioridadeBadge from './PrioridadeBadge'
import StatusBadge from './StatusBadge'
import { formatarData } from '../constants/ocorrencia'

const Cartao = styled(Link)`
  display: block;
  padding: ${({ theme }) => theme.espaco(5)};
  background: ${({ theme }) => theme.cores.superficie};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: ${({ theme }) => theme.raio};
  box-shadow: ${({ theme }) => theme.sombra};
  color: inherit;
  text-decoration: none;

  &:hover {
    border-color: ${({ theme }) => theme.cores.primaria};
  }
`

const Topo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.espaco(4)};
`

const Titulo = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fonte.normal};
`

const Descricao = styled.p`
  margin: ${({ theme }) => theme.espaco(2)} 0 ${({ theme }) => theme.espaco(3)};
  color: ${({ theme }) => theme.cores.textoFraco};
  font-size: ${({ theme }) => theme.fonte.pequena};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Rodape = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.espaco(2)};
  flex-wrap: wrap;
`

const Data = styled.span`
  margin-left: auto;
  font-size: ${({ theme }) => theme.fonte.pequena};
  color: ${({ theme }) => theme.cores.textoFraco};
`

function OcorrenciaCard({ ocorrencia }) {
  return (
    <Cartao to={`/ocorrencias/${ocorrencia.id}`}>
      <Topo>
        <Titulo>{ocorrencia.titulo}</Titulo>
        <StatusBadge status={ocorrencia.status} />
      </Topo>

      <Descricao>{ocorrencia.descricao}</Descricao>

      <Rodape>
        <CategoriaBadge categoria={ocorrencia.categoria} />
        <PrioridadeBadge prioridade={ocorrencia.prioridade} />
        <Data>{formatarData(ocorrencia.createdAt)}</Data>
      </Rodape>
    </Cartao>
  )
}

export default OcorrenciaCard
