import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import Button from '../components/Button'
import Cartao from '../components/Cartao'
import Input, { Campo, Rotulo, Select, TextArea } from '../components/Input'
import Mensagem from '../components/Mensagem'
import { CATEGORIAS } from '../constants/ocorrencia'
import * as servico from '../services/ocorrencias'

const TAMANHO_MAXIMO_MB = 5

const Titulo = styled.h1`
  margin: 0 0 ${({ theme }) => theme.espaco(6)};
  font-size: ${({ theme }) => theme.fonte.destaque};
`

const Previa = styled.img`
  margin-top: ${({ theme }) => theme.espaco(3)};
  max-width: 100%;
  max-height: 260px;
  border-radius: ${({ theme }) => theme.raio};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  display: block;
`

const Acoes = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.espaco(3)};
`

const INICIAL = { titulo: '', descricao: '', categoria: 'iluminacao', localizacao: '' }

function NovaOcorrencia() {
  const navegar = useNavigate()
  const [form, setForm] = useState(INICIAL)
  const [imagem, setImagem] = useState(null)
  const [previa, setPrevia] = useState(null)
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // A URL da previa e um objeto do navegador: sem revoke, vaza a cada troca de arquivo.
  useEffect(() => {
    if (!imagem) {
      setPrevia(null)
      return
    }

    const url = URL.createObjectURL(imagem)
    setPrevia(url)

    return () => URL.revokeObjectURL(url)
  }, [imagem])

  function mudar(evento) {
    setForm((atual) => ({ ...atual, [evento.target.name]: evento.target.value }))
  }

  function escolherImagem(evento) {
    const arquivo = evento.target.files?.[0] || null

    if (arquivo && arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
      setErro(`Imagem maior que ${TAMANHO_MAXIMO_MB}MB`)
      evento.target.value = ''
      setImagem(null)
      return
    }

    setErro(null)
    setImagem(arquivo)
  }

  async function enviar(evento) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)

    try {
      const criada = await servico.registrar({ ...form, imagem })
      navegar(`/ocorrencias/${criada.id}`, { replace: true })
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <Titulo>Nova ocorrência</Titulo>

      <Cartao as="form" onSubmit={enviar}>
        {erro && <Mensagem role="alert">{erro}</Mensagem>}

        <Campo>
          <Rotulo htmlFor="titulo">Título</Rotulo>
          <Input
            id="titulo"
            name="titulo"
            value={form.titulo}
            onChange={mudar}
            maxLength={120}
            required
          />
        </Campo>

        <Campo>
          <Rotulo htmlFor="descricao">Descrição</Rotulo>
          <TextArea
            id="descricao"
            name="descricao"
            value={form.descricao}
            onChange={mudar}
            maxLength={2000}
            required
          />
        </Campo>

        <Campo>
          <Rotulo htmlFor="categoria">Categoria</Rotulo>
          <Select id="categoria" name="categoria" value={form.categoria} onChange={mudar}>
            {CATEGORIAS.map((item) => (
              <option key={item.valor} value={item.valor}>
                {item.rotulo}
              </option>
            ))}
          </Select>
        </Campo>

        <Campo>
          <Rotulo htmlFor="localizacao">Localização</Rotulo>
          <Input
            id="localizacao"
            name="localizacao"
            value={form.localizacao}
            onChange={mudar}
            placeholder="Rua, número, ponto de referência"
            required
          />
        </Campo>

        <Campo>
          <Rotulo htmlFor="imagem">Imagem (opcional)</Rotulo>
          <input
            id="imagem"
            name="imagem"
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={escolherImagem}
          />
          {previa && <Previa src={previa} alt="Prévia da imagem escolhida" />}
        </Campo>

        <Acoes>
          <Button type="submit" disabled={enviando}>
            {enviando ? 'Registrando…' : 'Registrar ocorrência'}
          </Button>
          <Button type="button" $variante="secundaria" onClick={() => navegar(-1)}>
            Cancelar
          </Button>
        </Acoes>
      </Cartao>
    </>
  )
}

export default NovaOcorrencia
