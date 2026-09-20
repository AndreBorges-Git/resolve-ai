import styled from 'styled-components'

const Cartao = styled.div`
  background: ${({ theme }) => theme.cores.superficie};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: ${({ theme }) => theme.raio};
  box-shadow: ${({ theme }) => theme.sombra};
  padding: ${({ theme }) => theme.espaco(5)};
`

export default Cartao
