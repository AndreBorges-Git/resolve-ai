import styled from 'styled-components'

const Caixa = styled.div`
  padding: ${({ theme }) => theme.espaco(12)} ${({ theme }) => theme.espaco(6)};
  text-align: center;
  background: ${({ theme }) => theme.cores.superficie};
  border: 1px dashed ${({ theme }) => theme.cores.borda};
  border-radius: ${({ theme }) => theme.raio};
  color: ${({ theme }) => theme.cores.textoFraco};
`

const Titulo = styled.p`
  margin: 0 0 ${({ theme }) => theme.espaco(2)};
  font-weight: 600;
  color: ${({ theme }) => theme.cores.texto};
`

function EmptyState({ titulo, descricao, children }) {
  return (
    <Caixa>
      <Titulo>{titulo}</Titulo>
      {descricao && <p>{descricao}</p>}
      {children}
    </Caixa>
  )
}

export default EmptyState
