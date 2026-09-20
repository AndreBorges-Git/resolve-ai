import { useState } from 'react'
import styled from 'styled-components'

import Button from './Button'
import Cartao from './Cartao'
import Mensagem from './Mensagem'
import { TextArea } from './Input'
import { formatarDataHora } from '../constants/ocorrencia'

const Titulo = styled.h2`
  margin: 0 0 ${({ theme }) => theme.espaco(5)};
  font-size: ${({ theme }) => theme.fonte.titulo};
`

const Lista = styled.ul`
  list-style: none;
  margin: 0 0 ${({ theme }) => theme.espaco(5)};
  padding: 0;
  display: grid;
  gap: ${({ theme }) => theme.espaco(3)};
`

const Item = styled.li`
  padding: ${({ theme }) => theme.espaco(3)};
  background: ${({ theme }) => theme.cores.fundo};
  border-radius: ${({ theme }) => theme.raio};
`

const Autor = styled.p`
  margin: 0 0 ${({ theme }) => theme.espaco(1)};
  font-size: ${({ theme }) => theme.fonte.pequena};
  color: ${({ theme }) => theme.cores.textoFraco};

  strong {
    color: ${({ theme }) => theme.cores.texto};
  }
`

const Texto = styled.p`
  margin: 0;
  white-space: pre-wrap;
`

const Vazio = styled.p`
  margin: 0 0 ${({ theme }) => theme.espaco(5)};
  color: ${({ theme }) => theme.cores.textoFraco};
`

function Comentarios({ comentarios, aoComentar }) {
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)

    try {
      await aoComentar(texto)
      setTexto('')
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Cartao>
      <Titulo>Comentários</Titulo>

      {erro && <Mensagem role="alert">{erro}</Mensagem>}

      {comentarios.length === 0 ? (
        <Vazio>Nenhum comentário ainda.</Vazio>
      ) : (
        <Lista>
          {comentarios.map((comentario) => (
            <Item key={comentario.id}>
              <Autor>
                <strong>{comentario.autor?.nome || 'usuário removido'}</strong>
                {comentario.autor?.perfil === 'gestor' && ' · gestor'} ·{' '}
                {formatarDataHora(comentario.data)}
              </Autor>
              <Texto>{comentario.texto}</Texto>
            </Item>
          ))}
        </Lista>
      )}

      <form onSubmit={enviar}>
        <TextArea
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder="Escreva um comentário"
          maxLength={1000}
          style={{ minHeight: 80, marginBottom: 12 }}
          required
        />
        <Button type="submit" disabled={enviando || !texto.trim()}>
          {enviando ? 'Enviando…' : 'Comentar'}
        </Button>
      </form>
    </Cartao>
  )
}

export default Comentarios
