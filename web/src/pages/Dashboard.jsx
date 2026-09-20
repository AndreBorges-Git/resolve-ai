import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import styled, { useTheme } from 'styled-components'

import Cartao from '../components/Cartao'
import EmptyState from '../components/EmptyState'
import Mensagem from '../components/Mensagem'
import { ROTULO_CATEGORIA, ROTULO_STATUS } from '../constants/ocorrencia'
import * as servico from '../services/dashboard'

const Titulo = styled.h1`
  margin: 0 0 ${({ theme }) => theme.espaco(6)};
  font-size: ${({ theme }) => theme.fonte.destaque};
`

const Cartoes = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: ${({ theme }) => theme.espaco(4)};
  margin-bottom: ${({ theme }) => theme.espaco(6)};
`

const Numero = styled.p`
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme, $cor }) => $cor || theme.cores.primaria};
`

const Legenda = styled.p`
  margin: ${({ theme }) => theme.espaco(1)} 0 0;
  font-size: ${({ theme }) => theme.fonte.pequena};
  color: ${({ theme }) => theme.cores.textoFraco};
`

const Graficos = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.espaco(5)};

  @media (min-width: 860px) {
    grid-template-columns: 1.3fr 1fr;
  }
`

const Secao = styled.h2`
  margin: 0 0 ${({ theme }) => theme.espaco(4)};
  font-size: ${({ theme }) => theme.fonte.titulo};
`

function Indicador({ valor, rotulo, cor }) {
  return (
    <Cartao>
      <Numero $cor={cor}>{valor}</Numero>
      <Legenda>{rotulo}</Legenda>
    </Cartao>
  )
}

function Dashboard() {
  const tema = useTheme()
  const [indicadores, setIndicadores] = useState(null)
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    servico
      .obterIndicadores()
      .then(setIndicadores)
      .catch((falha) => setErro(falha.message))
      .finally(() => setCarregando(false))
  }, [])

  if (carregando) return <p>Carregando…</p>
  if (erro) return <Mensagem role="alert">{erro}</Mensagem>

  const { total, porStatus, porCategoria, tempoMedioResolucaoHoras, avaliacaoMedia } = indicadores

  // O back ja devolve todas as chaves, inclusive as zeradas; o grafico de pizza
  // fica ilegivel com fatias de zero, entao filtramos so na visualizacao.
  const dadosStatus = Object.entries(porStatus)
    .filter(([, valor]) => valor > 0)
    .map(([chave, valor]) => ({ nome: ROTULO_STATUS[chave] || chave, valor, chave }))

  const dadosCategoria = Object.entries(porCategoria)
    .map(([chave, valor]) => ({ nome: ROTULO_CATEGORIA[chave] || chave, valor }))
    .filter((item) => item.valor > 0)

  return (
    <>
      <Titulo>Dashboard</Titulo>

      <Cartoes>
        <Indicador valor={total} rotulo="Ocorrências no total" />
        <Indicador valor={porStatus.aberta} rotulo="Abertas" cor={tema.status.aberta.texto} />
        <Indicador
          valor={porStatus.em_atendimento}
          rotulo="Em atendimento"
          cor={tema.status.em_atendimento.texto}
        />
        <Indicador
          valor={porStatus.resolvida}
          rotulo="Resolvidas"
          cor={tema.status.resolvida.texto}
        />
        <Indicador
          valor={tempoMedioResolucaoHoras === null ? '—' : `${tempoMedioResolucaoHoras}h`}
          rotulo="Tempo médio de resolução"
        />
        <Indicador
          valor={avaliacaoMedia === null ? '—' : avaliacaoMedia}
          rotulo="Avaliação média (1 a 5)"
        />
      </Cartoes>

      {total === 0 ? (
        <EmptyState
          titulo="Ainda não há ocorrências"
          descricao="Os gráficos aparecem assim que a primeira for registrada."
        />
      ) : (
        <Graficos>
          <Cartao>
            <Secao>Por categoria</Secao>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosCategoria} margin={{ top: 8, right: 8, bottom: 8, left: -20 }}>
                <XAxis dataKey="nome" fontSize={12} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="valor" name="Ocorrências" fill={tema.cores.primaria} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Cartao>

          <Cartao>
            <Secao>Por status</Secao>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={dadosStatus} dataKey="valor" nameKey="nome" outerRadius={90} label>
                  {dadosStatus.map((item) => (
                    <Cell key={item.chave} fill={tema.status[item.chave]?.texto || tema.cores.primaria} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend fontSize={12} />
              </PieChart>
            </ResponsiveContainer>
          </Cartao>
        </Graficos>
      )}
    </>
  )
}

export default Dashboard
