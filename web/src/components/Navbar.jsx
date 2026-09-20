import { NavLink, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import Button from './Button'
import { useAuth } from '../context/AuthContext'

const Barra = styled.header`
  background: ${({ theme }) => theme.cores.superficie};
  border-bottom: 1px solid ${({ theme }) => theme.cores.borda};
`

const Conteudo = styled.nav`
  max-width: ${({ theme }) => theme.larguraMaxima};
  margin: 0 auto;
  padding: ${({ theme }) => theme.espaco(3)} ${({ theme }) => theme.espaco(4)};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.espaco(5)};
  flex-wrap: wrap;
`

const Marca = styled(NavLink)`
  font-weight: 700;
  font-size: ${({ theme }) => theme.fonte.titulo};
  color: ${({ theme }) => theme.cores.primaria};
  text-decoration: none;
`

const Itens = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.espaco(4)};
  flex: 1;
  flex-wrap: wrap;
`

const Item = styled(NavLink)`
  color: ${({ theme }) => theme.cores.textoFraco};
  text-decoration: none;
  font-weight: 600;
  padding-bottom: 2px;

  &.active {
    color: ${({ theme }) => theme.cores.primaria};
    border-bottom: 2px solid ${({ theme }) => theme.cores.primaria};
  }
`

const Usuario = styled.span`
  font-size: ${({ theme }) => theme.fonte.pequena};
  color: ${({ theme }) => theme.cores.textoFraco};
`

function Navbar() {
  const { usuario, ehGestor, sair } = useAuth()
  const navegar = useNavigate()

  function sairEVoltar() {
    sair()
    navegar('/login', { replace: true })
  }

  return (
    <Barra>
      <Conteudo>
        <Marca to="/">Resolve Aí</Marca>

        {/* O menu muda com o perfil: solicitante nunca ve painel nem dashboard. */}
        <Itens>
          {ehGestor ? (
            <>
              <Item to="/painel">Painel</Item>
              <Item to="/dashboard">Dashboard</Item>
            </>
          ) : (
            <>
              <Item to="/" end>
                Minhas ocorrências
              </Item>
              <Item to="/ocorrencias/nova">Nova ocorrência</Item>
            </>
          )}
        </Itens>

        <Usuario>
          {usuario?.nome} · {ehGestor ? 'gestor' : 'solicitante'}
        </Usuario>
        <Button type="button" $variante="secundaria" onClick={sairEVoltar}>
          Sair
        </Button>
      </Conteudo>
    </Barra>
  )
}

export default Navbar
