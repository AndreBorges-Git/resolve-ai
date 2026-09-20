import styled from 'styled-components'

const Linha = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.espaco(1)};
`

const Estrela = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 26px;
  line-height: 1;
  cursor: ${({ $somenteLeitura }) => ($somenteLeitura ? 'default' : 'pointer')};
  color: ${({ $ativa, theme }) => ($ativa ? '#e0a52a' : theme.cores.borda)};
`

function Estrelas({ nota = 0, aoEscolher, somenteLeitura = false }) {
  return (
    <Linha role={somenteLeitura ? 'img' : 'radiogroup'} aria-label={`Nota ${nota} de 5`}>
      {[1, 2, 3, 4, 5].map((valor) => (
        <Estrela
          key={valor}
          type="button"
          $ativa={valor <= nota}
          $somenteLeitura={somenteLeitura}
          disabled={somenteLeitura}
          aria-label={`${valor} estrela${valor > 1 ? 's' : ''}`}
          onClick={somenteLeitura ? undefined : () => aoEscolher(valor)}
        >
          ★
        </Estrela>
      ))}
    </Linha>
  )
}

export default Estrelas
