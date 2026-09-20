# Resolve Aí — requisitos extraídos do enunciado oficial

> Extraído em 25/08/2026 do PDF `POSTECH — Hackathon — FSDT — Fase 5`. Tudo abaixo está no enunciado; nada foi inferido. O que é interpretação minha está marcado como tal.

---

## ⚠️ Correção de rota

O enunciado é **"Resolve Aí — Plataforma de Gestão de Ocorrências"**. O tema "auxílio aos professores e professoras do ensino público", sobre o qual `PLANO-HACKATON.md`, `PLANO-HACKATON-V2.md` e `PIVO-AGENTES.md` foram escritos, **não aparece em lugar nenhum do documento**.

Consequência: o produto Aula+, o pivô do JobAgent, o seed da BNCC, o prompt de geração de plano de aula e os dados da TALIS estão fora. A pasta `aula-mais/` e os três planos viram arquivo morto.

**O que sobrevive:** o inventário de `STACK-DO-CURSO.md` — e ele sai *reforçado*, porque o enunciado exige exatamente as camadas que as fases 2, 3 e 4 cobriram.

**O que precisa ser verificado com urgência:** os planos antigos afirmam prazo 29/09, dois vídeos de 8 minutos, relatório de 7 seções e uma divisão de nota (30% funcionalidade, 20% problema e impacto…). **Nada disso está neste PDF.** Como o tema veio errado da mesma origem, esses números não podem ser tratados como confiáveis até você conferir na plataforma da FIAP. O único percentual que o enunciado dá é: o Hackathon vale **90% da nota final** da fase.

---

## 1. O que o enunciado pede

**Objetivo literal:** desenvolver uma aplicação Full Stack completa (MVP), **da descoberta do domínio até a publicação em ambiente Cloud**.

A solução deverá contemplar:

| # | Item exigido | Situação |
|---|---|---|
| 1 | Arquitetura de software | ⬜ |
| 2 | Backend | ⬜ |
| 3 | APIs | ⬜ |
| 4 | Banco de dados | ⬜ |
| 5 | Frontend | ⬜ |
| 6 | Testes | ⬜ |
| 7 | **Docker** | ⬜ obrigatório, não opcional |
| 8 | **Deploy em Cloud** | ⬜ obrigatório — não basta rodar local |
| 9 | Documentação | ⬜ |

**Formato:** "em princípio, deve ser desenvolvida em grupo." O enunciado não diz que solo é permitido nem que é proibido — precisa ser confirmado com a coordenação.

**Contexto do produto:** condomínios, empresas, bairros e organizações. As solicitações hoje chegam por mensagem, e-mail ou conversa informal, o que dificulta priorizar e acompanhar.

**Categorias de ocorrência citadas:** iluminação, equipamentos quebrados, falta de acessibilidade, limpeza, vazamentos, segurança, solicitações de manutenção, e outras definidas pelo grupo.

---

## 2. Perfil Solicitante — 10 capacidades obrigatórias

| # | Capacidade |
|---|---|
| 1 | Criar uma conta |
| 2 | Autenticar-se |
| 3 | Registrar uma ocorrência |
| 4 | Informar título, descrição e categoria |
| 5 | Informar localização |
| 6 | Anexar uma imagem |
| 7 | Acompanhar o andamento |
| 8 | Adicionar comentários |
| 9 | Consultar o histórico |
| 10 | Avaliar a resolução |

## 3. Perfil Gestor — 8 capacidades obrigatórias

| # | Capacidade |
|---|---|
| 1 | Visualizar todas as ocorrências |
| 2 | Filtrar por categoria, status e prioridade |
| 3 | Alterar prioridade |
| 4 | Atribuir um responsável |
| 5 | Atualizar o status |
| 6 | Adicionar comentários |
| 7 | Registrar a solução aplicada |
| 8 | Visualizar indicadores em um **dashboard** |

**São 18 capacidades explícitas.** Isso é escopo maior do que o Aula+ tinha — mas é quase todo CRUD, que é o tipo de trabalho mais previsível que existe, e boa parte sai de cópia da Fase 2.

---

## 4. Ciclo de vida da ocorrência

```
Aberta → Em análise → Em atendimento → Resolvida
   ↓          ↓             ↓
        Cancelada  (a partir de qualquer estado anterior a Resolvida)
```

Cinco estados no mínimo: Aberta, Em análise, Em atendimento, Resolvida, Cancelada.

**Trilha de auditoria — requisito explícito e destacado no diagrama.** Toda mudança de status deve gerar um registro contendo:

- Status anterior
- Novo status
- Data e horário
- Usuário responsável
- Observação da alteração

O enunciado grifa: "cada transição de status deve ser auditável". *Interpretação minha:* isso é o item mais fácil de fazer pela metade e o mais fácil de um avaliador conferir — é onde vale caprichar.

---

## 5. Modelo de domínio proposto

*Esta seção é proposta minha, derivada dos requisitos acima.*

| Coleção | Campos |
|---|---|
| `Usuario` | nome, email, senha (hash), **perfil** (`solicitante` \| `gestor`), createdAt |
| `Ocorrencia` | titulo, descricao, categoria, localizacao, imagemUrl, prioridade (`baixa`\|`media`\|`alta`), status, solicitante (ref), responsavel (ref, opcional), solucaoAplicada, avaliacao { nota, comentario }, createdAt, updatedAt |
| `HistoricoStatus` | ocorrencia (ref), statusAnterior, statusNovo, usuario (ref), observacao, data |
| `Comentario` | ocorrencia (ref), autor (ref), texto, data |

`Comentario` pode ser subdocumento de `Ocorrencia`; `HistoricoStatus` é melhor como coleção própria, porque é consultado e auditado por si só.

---

## 6. O que dá para copiar da Fase 2 e 3

| Item | Origem | Ajuste necessário |
|---|---|---|
| Auth JWT + bcryptjs, middleware de autenticação | `fase2/src/middleware`, `authRoutes` | acrescentar **autorização por perfil** (`solicitante` vs `gestor`) — é o único trabalho real |
| Modelo `Professor` | `fase2/src/models/Professor.js` | vira `Usuario` com o campo `perfil` |
| Modelo `Post` | `fase2/src/models/Post.js` | vira `Ocorrencia`, com bem mais campos |
| Estrutura Routes → Controllers → Models | Fase 2 inteira | copiar tal como está |
| Jest + Supertest, estrutura de testes | `fase2/tests/` | copiar e adaptar os casos |
| Dockerfile + docker-compose | Fases 2 e 3 | copiar; agora é requisito, não enfeite |
| GitHub Actions CI | `fase2/.github/workflows/ci.yml` | copiar |
| Coleção Postman | `fase2/postman/` | serve como parte da Documentação exigida |
| `PrivateRoute`, `Navbar`, camada de serviços Axios | `fase3/src` | copiar; `PrivateRoute` ganha checagem de perfil |
| React + Vite + React Router + styled-components | Fase 3 | copiar o setup |

**A decisão de stack está confirmada pelo enunciado.** Backend, APIs, banco, frontend, testes, Docker e documentação são exatamente o que você já fez nas fases anteriores. Nenhuma tecnologia nova é exigida.

---

## 7. O que é novo — e onde mora o risco

| Novo | Por quê | Caminho mais barato |
|---|---|---|
| **Deploy em Cloud** | requisito explícito; nas fases anteriores tudo rodava local | API em Render ou Railway (free), front na Vercel, banco no MongoDB Atlas que você já usa. Fazer isso na **primeira semana**, não na última — deploy que só é testado no fim sempre quebra |
| **Upload de imagem** | Solicitante precisa anexar imagem | Cloudinary free tier via `multer` + upload direto. **Não** salvar em disco: o disco de um host cloud é efêmero e a imagem some |
| **Dashboard de indicadores** | exigência do Gestor | agregação no Mongo (contagem por status, por categoria, tempo médio de resolução) + Recharts no front. 4 números e 2 gráficos bastam |
| **Autorização por perfil** | duas experiências distintas na mesma app | middleware `requirePerfil('gestor')` nas rotas de gestão |
| **Trilha de auditoria** | requisito destacado | gravar o histórico dentro do mesmo controller que muda o status, nunca em outro lugar |

*Interpretação minha:* deploy e upload de imagem são os dois que costumam consumir uma tarde inteira sem aviso. Ambos devem ser resolvidos cedo, com o app ainda vazio.

---

## 8. IA no produto?

O enunciado **não pede nada de IA**. Seu objetivo declarado no projeto — usar IA para ajudar a desenvolver software — é sobre o processo, não sobre o produto, e continua valendo integralmente.

Se sobrar tempo depois de fechar as 18 capacidades, uma sugestão de diferencial barato: **sugerir automaticamente a categoria e a prioridade** a partir do título e da descrição da ocorrência. É uma chamada de LLM em um controller, aproveita o que você já sabe do JobAgent, e é demoável em 15 segundos. Mas é sobremesa: só depois do prato principal.

---

## 9. Perguntas em aberto

1. **Grupo ou solo?** O enunciado diz que "em princípio" é atividade em grupo.
2. **Prazo real e entregáveis.** O 29/09, os dois vídeos e o relatório de 7 seções não estão neste PDF. Conferir na plataforma da FIAP qual é o documento que define isso.
3. **Existe um documento complementar de avaliação?** A divisão de nota citada nos planos antigos precisa de fonte.
