import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import Button from '../components/Button'
import Input, { Campo, Rotulo } from '../components/Input'
import Mensagem from '../components/Mensagem'
import { useAuth } from '../context/AuthContext'

export const Tela = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.espaco(4)};
`

export const Caixa = styled.form`
  width: 100%;
  max-width: 400px;
  background: ${({ theme }) => theme.cores.superficie};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: ${({ theme }) => theme.raio};
  box-shadow: ${({ theme }) => theme.sombra};
  padding: ${({ theme }) => theme.espaco(8)};
`

export const Marca = styled.h1`
  margin: 0 0 ${({ theme }) => theme.espaco(1)};
  color: ${({ theme }) => theme.cores.primaria};
`

export const Subtitulo = styled.p`
  margin: 0 0 ${({ theme }) => theme.espaco(6)};
  color: ${({ theme }) => theme.cores.textoFraco};
  font-size: ${({ theme }) => theme.fonte.pequena};
`

export const Rodape = styled.p`
  margin: ${({ theme }) => theme.espaco(5)} 0 0;
  text-align: center;
  font-size: ${({ theme }) => theme.fonte.pequena};
  color: ${({ theme }) => theme.cores.textoFraco};
`

function Login() {
  const { entrar, autenticado, carregando } = useAuth()
  const navegar = useNavigate()
  const local = useLocation()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (!carregando && autenticado) {
    return <Navigate to={local.state?.de || '/'} replace />
  }

  function mudar(evento) {
    setForm((atual) => ({ ...atual, [evento.target.name]: evento.target.value }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)

    try {
      const usuario = await entrar(form)
      navegar(usuario.perfil === 'gestor' ? '/painel' : '/', { replace: true })
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Tela>
      <Caixa onSubmit={enviar}>
        <Marca>Resolve Aí</Marca>
        <Subtitulo>Entre para registrar e acompanhar ocorrências.</Subtitulo>

        {erro && <Mensagem role="alert">{erro}</Mensagem>}

        <Campo>
          <Rotulo htmlFor="email">E-mail</Rotulo>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={mudar}
            autoComplete="email"
            required
          />
        </Campo>

        <Campo>
          <Rotulo htmlFor="senha">Senha</Rotulo>
          <Input
            id="senha"
            name="senha"
            type="password"
            value={form.senha}
            onChange={mudar}
            autoComplete="current-password"
            required
          />
        </Campo>

        <Button type="submit" $bloco disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </Button>

        <Rodape>
          Ainda não tem conta? <Link to="/registro">Criar conta</Link>
        </Rodape>
      </Caixa>
    </Tela>
  )
}

export default Login
