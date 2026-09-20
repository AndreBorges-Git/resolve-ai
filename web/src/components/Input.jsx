import styled from 'styled-components'

const campo = `
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 15px;
  background: #fff;
`

export const Rotulo = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.espaco(1.5)};
  font-size: ${({ theme }) => theme.fonte.pequena};
  font-weight: 600;
  color: ${({ theme }) => theme.cores.textoFraco};
`

export const Campo = styled.div`
  margin-bottom: ${({ theme }) => theme.espaco(4)};
`

const Input = styled.input`
  ${campo}
  border: 1px solid ${({ theme }) => theme.cores.borda};
  color: ${({ theme }) => theme.cores.texto};

  &:focus {
    outline: 2px solid ${({ theme }) => theme.cores.primaria};
    outline-offset: -1px;
  }
`

export const TextArea = styled.textarea`
  ${campo}
  border: 1px solid ${({ theme }) => theme.cores.borda};
  color: ${({ theme }) => theme.cores.texto};
  min-height: 120px;
  resize: vertical;
`

export const Select = styled.select`
  ${campo}
  border: 1px solid ${({ theme }) => theme.cores.borda};
  color: ${({ theme }) => theme.cores.texto};
`

export default Input
