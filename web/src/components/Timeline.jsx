import styled from 'styled-components'

import { ROTULO_STATUS, formatarDataHora } from '../constants/ocorrencia'

// A prova visual da auditabilidade: cada linha e um registro de HistoricoStatus,
// gravado pelo mesmo caso de uso que mudou o status.
const Lista = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
`

const Item = styled.li`
  position: relative;
  padding: 0 0 ${({ theme }) => theme.espaco(6)} ${({ theme }) => theme.espaco(8)};
  border-left: 2px solid ${({ theme }) => theme.cores.borda};

  &:last-child {
    padding-bottom: 0;
    border-left-color: transparent;
  }
`

const Marcador = styled.span`
  position: absolute;
  left: -7px;
  top: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.cores.superficie};
  background: ${({ theme, $status }) => (theme.status[$status] || theme.status.cancelada).texto};
`

const Transicao = styled.p`
  margin: 0;
  font-weight: 600;
`

const De = styled.span`
  color: ${({ theme }) => theme.cores.textoFraco};
  font-weight: 400;
`

const Meta = styled.p`
  margin: ${({ theme }) => theme.espaco(1)} 0 0;
  font-size: ${({ theme }) => theme.fonte.pequena};
  color: ${({ theme }) => theme.cores.textoFraco};
`

const Observacao = styled.p`
  margin: ${({ theme }) => theme.espaco(2)} 0 0;
  padding: ${({ theme }) => theme.espaco(2)} ${({ theme }) => theme.espaco(3)};
  background: ${({ theme }) => theme.cores.fundo};
  border-radius: ${({ theme }) => theme.raio};
  font-size: ${({ theme }) => theme.fonte.pequena};
`

function rotular(status) {
  return ROTULO_STATUS[status] || status
}

function Timeline({ registros = [] }) {
  if (registros.length === 0) {
    return <p>Sem histórico registrado.</p>
  }

  return (
    <Lista>
      {registros.map((registro) => (
        <Item key={registro.id}>
          <Marcador $status={registro.statusNovo} />

          <Transicao>
            {registro.statusAnterior ? (
              <>
                <De>de</De> {rotular(registro.statusAnterior)} <De>para</De>{' '}
                {rotular(registro.statusNovo)}
              </>
            ) : (
              <>Ocorrência registrada como {rotular(registro.statusNovo)}</>
            )}
          </Transicao>

          <Meta>
            {formatarDataHora(registro.data)} · {registro.usuario?.nome || 'usuário removido'}
          </Meta>

          {registro.observacao && <Observacao>{registro.observacao}</Observacao>}
        </Item>
      ))}
    </Lista>
  )
}

export default Timeline
