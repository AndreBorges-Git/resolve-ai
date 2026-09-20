import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import Button from '../components/Button'
import Input, { Campo, Rotulo, Select } from '../components/Input'
import Mensagem from '../components/Mensagem'
import { useAuth } from '../context/AuthContext'
import { Caixa, Marca, Rodape, Subtitulo, Tela } from './Login'

const INICIAL = { nome: '', email: '', senha: '', perfil: 'solicitante' }

function Registro() {
  const { cadastrar, autenticado, carregando } = useAuth()
  const navegar = useNavigate()
  const [form, setForm] = useState(INICIAL)
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (!carregando && autenticado) {
    return <Navigate to="/" replace />
  }

  function mudar(evento) {
    setForm((atual) => ({ ...atual, [evento.target.name]: evento.target.value }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)

    try {
      const usuario = await cadastrar(form)
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
        <Marca>Criar conta</Marca>
        <Subtitulo>Solicitantes registram ocorrências; gestores acompanham a resolução.</Subtitulo>

        {erro && <Mensagem role="alert">{erro}</Mensagem>}

        <Campo>
          <Rotulo htmlFor="nome">Nome</Rotulo>
          <Input id="nome" name="nome" value={form.nome} onChange={mudar} required />
        </Campo>

        <Campo>
          <Rotulo htmlFor="email">E-mail</Rotulo>
          <Input id="email" name="email" type="email" value={form.email} onChange={mudar} required />
        </Campo>

        <Campo>
          <Rotulo htmlFor="senha">Senha</Rotulo>
          <Input
            id="senha"
            name="senha"
            type="password"
            value={form.senha}
            onChange={mudar}
            minLength={6}
            autoComplete="new-password"
            required
          />
        </Campo>

        <Campo>
          <Rotulo htmlFor="perfil">Perfil</Rotulo>
          <Select id="perfil" name="perfil" value={form.perfil} onChange={mudar}>
            <option value="solicitante">Solicitante</option>
            <option value="gestor">Gestor</option>
          </Select>
        </Campo>

        <Button type="submit" $bloco disabled={enviando}>
          {enviando ? 'Criando…' : 'Criar conta'}
        </Button>

        <Rodape>
          Já tem conta? <Link to="/login">Entrar</Link>
        </Rodape>
      </Caixa>
    </Tela>
  )
}

export default Registro
