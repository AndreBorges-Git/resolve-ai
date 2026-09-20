import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import Button from '../components/Button'
import Cartao from '../components/Cartao'
import EmptyState from '../components/EmptyState'
import Mensagem from '../components/Mensagem'
import PrioridadeBadge from '../components/PrioridadeBadge'
import StatusBadge from '../components/StatusBadge'
import { Select } from '../components/Input'
import {
  CATEGORIAS,
  PRIORIDADES,
  ROTULO_CATEGORIA,
  STATUS,
  formatarData
} from '../constants/ocorrencia'
import * as servico from '../services/ocorrencias'

const Titulo = styled.h1`
  margin: 0 0 ${({ theme }) => theme.espaco(6)};
  font-size: ${({ theme }) => theme.fonte.destaque};
`

const Filtros = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.espaco(3)};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.espaco(5)};
`

const Filtro = styled(Select)`
  width: auto;
  min-width: 170px;
`

const Tabela = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.fonte.pequena};

  th,
  td {
    text-align: left;
    padding: ${({ theme }) => theme.espaco(3)};
    border-bottom: 1px solid ${({ theme }) => theme.cores.borda};
  }

  th {
    color: ${({ theme }) => theme.cores.textoFraco};
    font-size: ${({ theme }) => theme.fonte.pequena};
  }

  tr:last-child td {
    border-bottom: none;
  }

  a {
    font-weight: 600;
    text-decoration: none;
  }
`

const Paginacao = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.espaco(3)};
  margin-top: ${({ theme }) => theme.espaco(5)};
  font-size: ${({ theme }) => theme.fonte.pequena};
  color: ${({ theme }) => theme.cores.textoFraco};
`

const SEM_FILTRO = { categoria: '', status: '', prioridade: '' }

function PainelGestor() {
  const [filtros, setFiltros] = useState(SEM_FILTRO)
  const [page, setPage] = useState(1)
  const [resultado, setResultado] = useState({ itens: [], total: 0, paginas: 1, page: 1 })
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)

    try {
      // Os tres filtros sao combinaveis: quem monta a query e a API.
      setResultado(
        await servico.listar({
          categoria: filtros.categoria || undefined,
          status: filtros.status || undefined,
          prioridade: filtros.prioridade || undefined,
          page,
          limit: 10
        })
      )
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setCarregando(false)
    }
  }, [filtros, page])

  useEffect(() => {
    carregar()
  }, [carregar])

  function mudarFiltro(campo, valor) {
    setFiltros((atuais) => ({ ...atuais, [campo]: valor }))
    setPage(1)
  }

  return (
    <>
      <Titulo>Painel de ocorrências</Titulo>

      <Filtros>
        <Filtro
          aria-label="Filtrar por categoria"
          value={filtros.categoria}
          onChange={(e) => mudarFiltro('categoria', e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map((item) => (
            <option key={item.valor} value={item.valor}>
              {item.rotulo}
            </option>
          ))}
        </Filtro>

        <Filtro
          aria-label="Filtrar por status"
          value={filtros.status}
          onChange={(e) => mudarFiltro('status', e.target.value)}
        >
          <option value="">Todos os status</option>
          {STATUS.map((item) => (
            <option key={item.valor} value={item.valor}>
              {item.rotulo}
            </option>
          ))}
        </Filtro>

        <Filtro
          aria-label="Filtrar por prioridade"
          value={filtros.prioridade}
          onChange={(e) => mudarFiltro('prioridade', e.target.value)}
        >
          <option value="">Todas as prioridades</option>
          {PRIORIDADES.map((item) => (
            <option key={item.valor} value={item.valor}>
              {item.rotulo}
            </option>
          ))}
        </Filtro>

        <Button type="button" $variante="secundaria" onClick={() => setFiltros(SEM_FILTRO)}>
          Limpar
        </Button>
      </Filtros>

      {erro && <Mensagem role="alert">{erro}</Mensagem>}

      {carregando ? (
        <p>Carregando…</p>
      ) : resultado.itens.length === 0 ? (
        <EmptyState
          titulo="Nenhuma ocorrência com esses filtros"
          descricao="Ajuste ou limpe os filtros para ver mais."
        />
      ) : (
        <Cartao>
          <Tabela>
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Solicitante</th>
                <th>Aberta em</th>
              </tr>
            </thead>
            <tbody>
              {resultado.itens.map((ocorrencia) => (
                <tr key={ocorrencia.id}>
                  <td>
                    <Link to={`/ocorrencias/${ocorrencia.id}`}>{ocorrencia.titulo}</Link>
                  </td>
                  <td>{ROTULO_CATEGORIA[ocorrencia.categoria] || ocorrencia.categoria}</td>
                  <td>
                    <StatusBadge status={ocorrencia.status} />
                  </td>
                  <td>
                    <PrioridadeBadge prioridade={ocorrencia.prioridade} />
                  </td>
                  <td>{ocorrencia.solicitante?.nome || '—'}</td>
                  <td>{formatarData(ocorrencia.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </Tabela>

          <Paginacao>
            <Button
              type="button"
              $variante="secundaria"
              disabled={page <= 1}
              onClick={() => setPage((atual) => atual - 1)}
            >
              Anterior
            </Button>
            <span>
              Página {resultado.page} de {resultado.paginas} · {resultado.total} ocorrências
            </span>
            <Button
              type="button"
              $variante="secundaria"
              disabled={page >= resultado.paginas}
              onClick={() => setPage((atual) => atual + 1)}
            >
              Próxima
            </Button>
          </Paginacao>
        </Cartao>
      )}
    </>
  )
}

export default PainelGestor
