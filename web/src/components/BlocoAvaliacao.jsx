import { useState } from 'react'
import styled from 'styled-components'

import Button from './Button'
import Cartao from './Cartao'
import Estrelas from './Estrelas'
import Mensagem from './Mensagem'
import { TextArea } from './Input'
import { formatarDataHora } from '../constants/ocorrencia'

const Titulo = styled.h2`
  margin: 0 0 ${({ theme }) => theme.espaco(4)};
  font-size: ${({ theme }) => theme.fonte.titulo};
`

const Meta = styled.p`
  margin: ${({ theme }) => theme.espaco(2)} 0 0;
  font-size: ${({ theme }) => theme.fonte.pequena};
  color: ${({ theme }) => theme.cores.textoFraco};
`

// Avaliar so faz sentido depois de resolvida e so para quem abriu. Quem decide e
// o caso de uso: aqui apenas evitamos oferecer o que seria recusado com 409.
function BlocoAvaliacao({ avaliacao, aoAvaliar }) {
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (avaliacao) {
    return (
      <Cartao>
        <Titulo>Sua avaliação</Titulo>
        <Estrelas nota={avaliacao.nota} somenteLeitura />
        {avaliacao.comentario && <Meta>“{avaliacao.comentario}”</Meta>}
        <Meta>Avaliada em {formatarDataHora(avaliacao.data)}</Meta>
      </Cartao>
    )
  }

  async function enviar(evento) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)

    try {
      await aoAvaliar({ nota, comentario })
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Cartao as="form" onSubmit={enviar}>
      <Titulo>Avaliar a resolução</Titulo>

      {erro && <Mensagem role="alert">{erro}</Mensagem>}

      <Estrelas nota={nota} aoEscolher={setNota} />

      <TextArea
        value={comentario}
        onChange={(evento) => setComentario(evento.target.value)}
        placeholder="Comentário sobre o atendimento (opcional)"
        maxLength={500}
        style={{ minHeight: 72, margin: '16px 0 12px' }}
      />

      <Button type="submit" disabled={enviando || nota === 0}>
        {enviando ? 'Enviando…' : 'Enviar avaliação'}
      </Button>
    </Cartao>
  )
}

export default BlocoAvaliacao
