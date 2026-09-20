import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import * as servicoAuth from '../services/auth'
import { CHAVE_TOKEN, CHAVE_USUARIO } from '../services/api'

const AuthContext = createContext(null)

function lerUsuarioSalvo() {
  try {
    const bruto = localStorage.getItem(CHAVE_USUARIO)
    return bruto ? JSON.parse(bruto) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(lerUsuarioSalvo)
  const [token, setToken] = useState(() => localStorage.getItem(CHAVE_TOKEN))
  const [carregando, setCarregando] = useState(Boolean(localStorage.getItem(CHAVE_TOKEN)))

  const sair = useCallback(() => {
    localStorage.removeItem(CHAVE_TOKEN)
    localStorage.removeItem(CHAVE_USUARIO)
    setToken(null)
    setUsuario(null)
  }, [])

  const guardar = useCallback(({ token: novoToken, usuario: novoUsuario }) => {
    localStorage.setItem(CHAVE_TOKEN, novoToken)
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(novoUsuario))
    setToken(novoToken)
    setUsuario(novoUsuario)
    return novoUsuario
  }, [])

  // Token guardado pode ter expirado enquanto a aba estava fechada:
  // confirmamos com a API antes de liberar as rotas privadas.
  useEffect(() => {
    if (!token) {
      setCarregando(false)
      return
    }

    let ativo = true

    servicoAuth
      .obterUsuarioAutenticado()
      .then((atual) => {
        if (!ativo) return
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(atual))
        setUsuario(atual)
      })
      .catch(() => {
        if (ativo) sair()
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
    // Roda so na montagem: reagir a cada troca de token relogaria o usuario recem-logado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const entrar = useCallback(
    async (credenciais) => guardar(await servicoAuth.login(credenciais)),
    [guardar]
  )

  const cadastrar = useCallback(
    async (dados) => guardar(await servicoAuth.registrar(dados)),
    [guardar]
  )

  const valor = useMemo(
    () => ({
      usuario,
      token,
      carregando,
      autenticado: Boolean(token && usuario),
      ehGestor: usuario?.perfil === 'gestor',
      entrar,
      cadastrar,
      sair
    }),
    [usuario, token, carregando, entrar, cadastrar, sair]
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)

  if (!contexto) {
    throw new Error('useAuth precisa estar dentro de AuthProvider')
  }

  return contexto
}

export default AuthContext
