import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'

import GlobalStyle from './styles/GlobalStyle'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import Dashboard from './pages/Dashboard'
import DetalheOcorrencia from './pages/DetalheOcorrencia'
import Login from './pages/Login'
import MinhasOcorrencias from './pages/MinhasOcorrencias'
import NovaOcorrencia from './pages/NovaOcorrencia'
import PainelGestor from './pages/PainelGestor'
import Registro from './pages/Registro'
import tema from './styles/tema'
import { AuthProvider, useAuth } from './context/AuthContext'

// A raiz e a lista do solicitante. Gestor nao tem "minhas ocorrencias": vai ao painel.
function Inicio() {
  const { ehGestor } = useAuth()

  return ehGestor ? <Navigate to="/painel" replace /> : <MinhasOcorrencias />
}

function App() {
  return (
    <ThemeProvider theme={tema}>
      <GlobalStyle />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />

            <Route
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Inicio />} />
              <Route path="/ocorrencias/nova" element={<NovaOcorrencia />} />
              <Route path="/ocorrencias/:id" element={<DetalheOcorrencia />} />

              {/* Painel e dashboard sao so do gestor; o back tambem recusa com 403. */}
              <Route
                path="/painel"
                element={
                  <PrivateRoute perfil="gestor">
                    <PainelGestor />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute perfil="gestor">
                    <Dashboard />
                  </PrivateRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
