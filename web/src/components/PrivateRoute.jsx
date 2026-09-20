import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

// Enquanto o contexto confirma o token guardado, nao decidimos nada: redirecionar
// aqui jogaria para o login quem ja estava logado.
function PrivateRoute({ children, perfil }) {
  const { autenticado, carregando, usuario } = useAuth()
  const local = useLocation()

  if (carregando) {
    return <p style={{ padding: 24 }}>Carregando…</p>
  }

  if (!autenticado) {
    return <Navigate to="/login" replace state={{ de: local.pathname }} />
  }

  if (perfil && usuario?.perfil !== perfil) {
    return <Navigate to="/" replace />
  }

  return children
}

export default PrivateRoute
