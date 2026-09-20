import styled, { css } from 'styled-components'

const variantes = {
  primaria: css`
    background: ${({ theme }) => theme.cores.primaria};
    border-color: ${({ theme }) => theme.cores.primaria};
    color: #fff;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.cores.primariaEscura};
      border-color: ${({ theme }) => theme.cores.primariaEscura};
    }
  `,
  secundaria: css`
    background: ${({ theme }) => theme.cores.superficie};
    border-color: ${({ theme }) => theme.cores.borda};
    color: ${({ theme }) => theme.cores.texto};

    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.cores.primaria};
      color: ${({ theme }) => theme.cores.primaria};
    }
  `,
  perigo: css`
    background: ${({ theme }) => theme.cores.perigo};
    border-color: ${({ theme }) => theme.cores.perigo};
    color: #fff;
  `
}

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.espaco(2)};
  padding: ${({ theme }) => `${theme.espaco(2.5)} ${theme.espaco(4)}`};
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.raio};
  font-size: ${({ theme }) => theme.fonte.normal};
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  width: ${({ $bloco }) => ($bloco ? '100%' : 'auto')};

  ${({ $variante = 'primaria' }) => variantes[$variante] || variantes.primaria}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export default Button
