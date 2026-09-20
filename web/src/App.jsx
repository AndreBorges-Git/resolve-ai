import { BrowserRouter, Route, Routes } from 'react-router-dom'

function Login() {
  return <h1>Login</h1>
}

function MinhasOcorrencias() {
  return <h1>Minhas ocorrências</h1>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MinhasOcorrencias />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
