import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import Mensagem from '../components/Mensagem'
import OcorrenciaCard from '../components/OcorrenciaCard'
import { Select } from '../components/Input'
import { STATUS } from '../constants/ocorrencia'
import * as servico from '../services/ocorrencias'

const Cabecalho = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.espaco(4)};
  margin-bottom: ${({ theme }) => theme.espaco(6)};
  flex-wrap: wrap;
`

const Titulo = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.fonte.destaque};
`

const Filtro = styled(Select)`
  width: auto;
  min-width: 180px;
`

const Lista = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.espaco(4)};
`

function MinhasOcorrencias() {
  const [ocorrencias, setOcorrencias] = useState([])
  const [status, setStatus] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)

    try {
      // A API ja limita o solicitante as proprias ocorrencias: nada de filtrar aqui.
      const resultado = await servico.listar({ status: status || undefined, limit: 50 })
      setOcorrencias(resultado.itens)
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setCarregando(false)
    }
  }, [status])

  useEffect(() => {
    carregar()
  }, [carregar])

  return (
    <>
      <Cabecalho>
        <Titulo>Minhas ocorrências</Titulo>
        <Filtro value={status} onChange={(evento) => setStatus(evento.target.value)}>
          <option value="">Todos os status</option>
          {STATUS.map((item) => (
            <option key={item.valor} value={item.valor}>
              {item.rotulo}
            </option>
          ))}
        </Filtro>
        <Button as={Link} to="/ocorrencias/nova">
          Nova ocorrência
        </Button>
      </Cabecalho>

      {erro && <Mensagem role="alert">{erro}</Mensagem>}

      {carregando ? (
        <p>Carregando…</p>
      ) : ocorrencias.length === 0 ? (
        <EmptyState
          titulo="Nenhuma ocorrência por aqui"
          descricao="Registre a primeira e acompanhe cada mudança de status."
        />
      ) : (
        <Lista>
          {ocorrencias.map((ocorrencia) => (
            <OcorrenciaCard key={ocorrencia.id} ocorrencia={ocorrencia} />
          ))}
        </Lista>
      )}
    </>
  )
}

export default MinhasOcorrencias
