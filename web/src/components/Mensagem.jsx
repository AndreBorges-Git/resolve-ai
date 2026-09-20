import styled from 'styled-components'

// Uma caixa so para erro e sucesso: as telas nao precisam de dois componentes.
const Mensagem = styled.p`
  margin: 0 0 ${({ theme }) => theme.espaco(4)};
  padding: ${({ theme }) => theme.espaco(3)};
  border-radius: ${({ theme }) => theme.raio};
  font-size: ${({ theme }) => theme.fonte.pequena};
  border: 1px solid
    ${({ theme, $tipo }) => ($tipo === 'sucesso' ? theme.cores.sucesso : theme.cores.perigo)};
  color: ${({ theme, $tipo }) => ($tipo === 'sucesso' ? theme.cores.sucesso : theme.cores.perigo)};
  background: ${({ $tipo }) => ($tipo === 'sucesso' ? '#e2f3e8' : '#fbe6e6')};
`

export default Mensagem
