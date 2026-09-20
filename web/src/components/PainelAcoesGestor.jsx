import { useEffect, useState } from 'react'
import styled from 'styled-components'

import Button from './Button'
import Cartao from './Cartao'
import Mensagem from './Mensagem'
import { Campo, Rotulo, Select, TextArea } from './Input'
import { PRIORIDADES, ehStatusFinal, proximosStatus } from '../constants/ocorrencia'
import * as servico from '../services/ocorrencias'
import * as servicoUsuarios from '../services/usuarios'

const Titulo = styled.h2`
  margin: 0 0 ${({ theme }) => theme.espaco(5)};
  font-size: ${({ theme }) => theme.fonte.titulo};
`

const Bloco = styled.div`
  padding-bottom: ${({ theme }) => theme.espaco(5)};
  margin-bottom: ${({ theme }) => theme.espaco(5)};
  border-bottom: 1px solid ${({ theme }) => theme.cores.borda};

  &:last-child {
    padding-bottom: 0;
    margin-bottom: 0;
    border-bottom: none;
  }
`

const Aviso = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.cores.textoFraco};
  font-size: ${({ theme }) => theme.fonte.pequena};
`

// Painel de acoes do gestor. Cada bloco chama um caso de uso diferente; a troca
// de status e a unica que exige observacao, porque e ela que vira linha na trilha.
function PainelAcoesGestor({ ocorrencia, aoAtualizar }) {
  const transicoes = proximosStatus(ocorrencia.status)
  const [status, setStatus] = useState(transicoes[0]?.valor || '')
  const [observacao, setObservacao] = useState('')
  const [prioridade, setPrioridade] = useState(ocorrencia.prioridade)
  const [responsavelId, setResponsavelId] = useState(ocorrencia.responsavel?.id || '')
  const [solucao, setSolucao] = useState(ocorrencia.solucaoAplicada || '')
  const [gestores, setGestores] = useState([])
  const [erro, setErro] = useState(null)
  const [ocupado, setOcupado] = useState(null)

  useEffect(() => {
    servicoUsuarios
      .listar({ perfil: 'gestor' })
      .then(setGestores)
      .catch(() => setGestores([]))
  }, [])

  // Depois de uma transicao o leque de destinos muda. Sem este sincronismo o
  // estado guardaria o status ja aplicado enquanto o select mostraria outro,
  // e o proximo envio repetiria a transicao anterior.
  useEffect(() => {
    setStatus(proximosStatus(ocorrencia.status)[0]?.valor || '')
    setPrioridade(ocorrencia.prioridade)
    setResponsavelId(ocorrencia.responsavel?.id || '')
  }, [ocorrencia.status, ocorrencia.prioridade, ocorrencia.responsavel?.id])

  async function executar(chave, acao) {
    setErro(null)
    setOcupado(chave)

    try {
      aoAtualizar(await acao())
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setOcupado(null)
    }
  }

  function mudarStatus(evento) {
    evento.preventDefault()
    executar('status', async () => {
      const atualizada = await servico.alterarStatus(ocorrencia.id, { status, observacao })
      setObservacao('')
      return atualizada
    })
  }

  return (
    <Cartao>
      <Titulo>Ações do gestor</Titulo>

      {erro && <Mensagem role="alert">{erro}</Mensagem>}

      <Bloco as="form" onSubmit={mudarStatus}>
        {ehStatusFinal(ocorrencia.status) ? (
          <Aviso>
            Esta ocorrência está em um status final e não aceita novas transições.
          </Aviso>
        ) : (
          <>
            <Campo>
              <Rotulo htmlFor="status">Mudar status</Rotulo>
              <Select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {transicoes.map((item) => (
                  <option key={item.valor} value={item.valor}>
                    {item.rotulo}
                  </option>
                ))}
              </Select>
            </Campo>

            <Campo>
              <Rotulo htmlFor="observacao">Observação (obrigatória)</Rotulo>
              <TextArea
                id="observacao"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="O que motivou esta mudança?"
                required
                style={{ minHeight: 72 }}
              />
            </Campo>

            <Button type="submit" disabled={ocupado === 'status' || !observacao.trim()}>
              {ocupado === 'status' ? 'Registrando…' : 'Registrar mudança'}
            </Button>
          </>
        )}
      </Bloco>

      <Bloco>
        <Campo>
          <Rotulo htmlFor="prioridade">Prioridade</Rotulo>
          <Select
            id="prioridade"
            value={prioridade}
            onChange={(e) => {
              setPrioridade(e.target.value)
              executar('prioridade', () => servico.alterarPrioridade(ocorrencia.id, e.target.value))
            }}
            disabled={ocupado === 'prioridade'}
          >
            {PRIORIDADES.map((item) => (
              <option key={item.valor} value={item.valor}>
                {item.rotulo}
              </option>
            ))}
          </Select>
        </Campo>

        <Campo style={{ marginBottom: 0 }}>
          <Rotulo htmlFor="responsavel">Responsável</Rotulo>
          <Select
            id="responsavel"
            value={responsavelId}
            onChange={(e) => {
              setResponsavelId(e.target.value)
              if (e.target.value) {
                executar('responsavel', () =>
                  servico.atribuirResponsavel(ocorrencia.id, e.target.value)
                )
              }
            }}
            disabled={ocupado === 'responsavel'}
          >
            <option value="">Sem responsável</option>
            {gestores.map((gestor) => (
              <option key={gestor.id} value={gestor.id}>
                {gestor.nome}
              </option>
            ))}
          </Select>
        </Campo>
      </Bloco>

      <Bloco
        as="form"
        onSubmit={(evento) => {
          evento.preventDefault()
          executar('solucao', () => servico.registrarSolucao(ocorrencia.id, solucao))
        }}
      >
        <Campo>
          <Rotulo htmlFor="solucao">Solução aplicada</Rotulo>
          <TextArea
            id="solucao"
            value={solucao}
            onChange={(e) => setSolucao(e.target.value)}
            placeholder="O que foi feito para resolver"
            style={{ minHeight: 72 }}
          />
        </Campo>

        <Button type="submit" $variante="secundaria" disabled={ocupado === 'solucao' || !solucao.trim()}>
          {ocupado === 'solucao' ? 'Salvando…' : 'Salvar solução'}
        </Button>
      </Bloco>
    </Cartao>
  )
}

export default PainelAcoesGestor
