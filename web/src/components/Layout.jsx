import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

import Navbar from './Navbar'

const Conteudo = styled.main`
  max-width: ${({ theme }) => theme.larguraMaxima};
  margin: 0 auto;
  padding: ${({ theme }) => theme.espaco(8)} ${({ theme }) => theme.espaco(4)};
`

function Layout() {
  return (
    <>
      <Navbar />
      <Conteudo>
        <Outlet />
      </Conteudo>
    </>
  )
}

export default Layout
