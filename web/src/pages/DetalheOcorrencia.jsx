import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'

import BlocoAvaliacao from '../components/BlocoAvaliacao'
import Cartao from '../components/Cartao'
import CategoriaBadge from '../components/CategoriaBadge'
import Comentarios from '../components/Comentarios'
import Mensagem from '../components/Mensagem'
import PainelAcoesGestor from '../components/PainelAcoesGestor'
import PrioridadeBadge from '../components/PrioridadeBadge'
import StatusBadge from '../components/StatusBadge'
import Timeline from '../components/Timeline'
import { formatarDataHora } from '../constants/ocorrencia'
import { useAuth } from '../context/AuthContext'
import * as servico from '../services/ocorrencias'

const Voltar = styled(Link)`
  display: inline-block;
  margin-bottom: ${({ theme }) => theme.espaco(4)};
  font-size: ${({ theme }) => theme.fonte.pequena};
  text-decoration: none;
`

const Titulo = styled.h1`
  margin: 0 0 ${({ theme }) => theme.espaco(3)};
  font-size: ${({ theme }) => theme.fonte.destaque};
`

const Etiquetas = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.espaco(2)};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.espaco(4)};
`

const Descricao = styled.p`
  margin: 0 0 ${({ theme }) => theme.espaco(4)};
  white-space: pre-wrap;
`

const Dados = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: ${({ theme }) => theme.espaco(2)} ${({ theme }) => theme.espaco(4)};
  font-size: ${({ theme }) => theme.fonte.pequena};

  dt {
    color: ${({ theme }) => theme.cores.textoFraco};
    font-weight: 600;
  }

  dd {
    margin: 0;
  }
`

const Imagem = styled.img`
  margin-top: ${({ theme }) => theme.espaco(4)};
  max-width: 100%;
  max-height: 320px;
  border-radius: ${({ theme }) => theme.raio};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  display: block;
`

const Colunas = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.espaco(5)};
  margin-top: ${({ theme }) => theme.espaco(5)};

  @media (min-width: 860px) {
    grid-template-columns: ${({ $duas }) => ($duas ? '1.4fr 1fr' : '1fr')};
    align-items: start;
  }
`

const Coluna = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.espaco(5)};
`

const Secao = styled.h2`
  margin: 0 0 ${({ theme }) => theme.espaco(5)};
  font-size: ${({ theme }) => theme.fonte.titulo};
`

function DetalheOcorrencia() {
  const { id } = useParams()
  const { usuario, ehGestor } = useAuth()
  const [ocorrencia, setOcorrencia] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [historico, setHistorico] = useState([])
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(true)

  // Uma chamada so: obter ja devolve comentarios e historico junto.
  const carregar = useCallback(async () => {
    setErro(null)

    try {
      const dados = await servico.obter(id)
      setOcorrencia(dados)
      setComentarios(dados.comentarios || [])
      setHistorico(dados.historico || [])
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setCarregando(false)
    }
  }, [id])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function comentar(texto) {
    const novo = await servico.comentar(id, texto)
    setComentarios((atuais) => [...atuais, novo])
  }

  async function avaliar({ nota, comentario }) {
    setOcorrencia(await servico.avaliar(id, { nota, comentario }))
  }

  // Mudar status, prioridade, responsavel ou solucao muda a trilha: recarrega tudo.
  function aposAcaoDoGestor() {
    carregar()
  }

  if (carregando) {
    return <p>Carregando…</p>
  }

  if (erro) {
    return <Mensagem role="alert">{erro}</Mensagem>
  }

  const ehDono = ocorrencia.solicitante?.id === usuario?.id
  const podeAvaliar = ehDono && ocorrencia.status === 'resolvida'

  return (
    <>
      <Voltar to={ehGestor ? '/painel' : '/'}>← Voltar</Voltar>

      <Cartao>
        <Titulo>{ocorrencia.titulo}</Titulo>

        <Etiquetas>
          <StatusBadge status={ocorrencia.status} />
          <CategoriaBadge categoria={ocorrencia.categoria} />
          <PrioridadeBadge prioridade={ocorrencia.prioridade} />
        </Etiquetas>

        <Descricao>{ocorrencia.descricao}</Descricao>

        <Dados>
          <dt>Localização</dt>
          <dd>{ocorrencia.localizacao}</dd>

          <dt>Solicitante</dt>
          <dd>{ocorrencia.solicitante?.nome || '—'}</dd>

          <dt>Responsável</dt>
          <dd>{ocorrencia.responsavel?.nome || 'não atribuído'}</dd>

          <dt>Aberta em</dt>
          <dd>{formatarDataHora(ocorrencia.createdAt)}</dd>

          {ocorrencia.resolvidaEm && (
            <>
              <dt>Resolvida em</dt>
              <dd>{formatarDataHora(ocorrencia.resolvidaEm)}</dd>
            </>
          )}

          {ocorrencia.solucaoAplicada && (
            <>
              <dt>Solução aplicada</dt>
              <dd>{ocorrencia.solucaoAplicada}</dd>
            </>
          )}
        </Dados>

        {ocorrencia.imagemUrl && <Imagem src={ocorrencia.imagemUrl} alt={ocorrencia.titulo} />}
      </Cartao>

      <Colunas $duas={ehGestor || podeAvaliar || Boolean(ocorrencia.avaliacao)}>
        <Coluna>
          <Cartao>
            <Secao>Histórico de status</Secao>
            <Timeline registros={historico} />
          </Cartao>

          <Comentarios comentarios={comentarios} aoComentar={comentar} />
        </Coluna>

        <Coluna>
          {ehGestor && <PainelAcoesGestor ocorrencia={ocorrencia} aoAtualizar={aposAcaoDoGestor} />}

          {ehDono && (podeAvaliar || ocorrencia.avaliacao) && (
            <BlocoAvaliacao avaliacao={ocorrencia.avaliacao} aoAvaliar={avaliar} />
          )}
        </Coluna>
      </Colunas>
    </>
  )
}

export default DetalheOcorrencia
