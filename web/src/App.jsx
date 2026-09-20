import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'

import GlobalStyle from './styles/GlobalStyle'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import MinhasOcorrencias from './pages/MinhasOcorrencias'
import NovaOcorrencia from './pages/NovaOcorrencia'
import Registro from './pages/Registro'
import tema from './styles/tema'
import { AuthProvider } from './context/AuthContext'

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
              <Route index element={<MinhasOcorrencias />} />
              <Route path="/ocorrencias/nova" element={<NovaOcorrencia />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
