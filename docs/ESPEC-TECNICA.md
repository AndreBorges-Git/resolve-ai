# Resolve Aí — Especificação Técnica

> Versão 2 — 20/09/2026. Revisada após a ementa da Fase 5.
> Contrato de implementação: arquitetura, modelos, endpoints, regras e telas.
> Requisitos oficiais em `DESAFIO-RESOLVE-AI.md`. Cronograma e runbook em `PLANO-9-DIAS.md`.

---

## 1. Stack — fixa, não negociável

A Fase 5 é uma fase de **DevOps em Azure, Clean Architecture, Microsserviços e Arquitetura Cloud**. A stack abaixo combina a base das fases 2–4 com o que esta fase exige.

| Camada | Tecnologia | Origem |
|---|---|---|
| Runtime | Node.js 22 | Fase 2 |
| Framework API | Express | Fase 2 |
| Módulos | CommonJS (`require`) | Fase 2 |
| Banco | MongoDB Atlas + Mongoose | Fase 2 |
| Auth | JWT + bcryptjs | Fase 2 |
| **Arquitetura** | **Clean Architecture** | **Fase 5 — módulo com 8 aulas** |
| Front | React 19 + Vite + React Router + styled-components | Fase 3 |
| HTTP | Axios | Fases 3 e 4 |
| Testes | Jest + Supertest | Fase 2 |
| Container | Docker | Fases 2, 3 e **5 (Aula 5)** |
| **Repositório e board** | **Azure Repos + Azure Boards** | **Fase 5 (Aula 1)** |
| **CI/CD** | **Azure Pipelines multi-stage** | **Fase 5 (Aulas 3 e 4)** |
| **Registry** | **Azure Container Registry (ACR)** | **Fase 5 (Aula 6)** |
| **Runtime Cloud** | **Azure Web App for Containers** | **Fase 5 (Aula 8)** |
| Imagens enviadas | Cloudinary | necessidade do enunciado |
| Gráficos | Recharts | necessidade do enunciado |

**Proibido:** TypeScript, Next.js, Prisma, Tailwind, ORM SQL, n8n. Sair disso quebra a coerência com o curso, que é argumento de defesa na banca.

### Decisão: monolito, não microsserviços

A Fase 5 tem um módulo de Microsserviços, e a Aula 2 chama-se "Quando usar microsserviços e monolitos". A entrega será um **monolito modular**, e a justificativa entra no relatório: equipe de uma pessoa, domínio único e coeso, nove dias de prazo, e nenhum requisito de escala independente entre partes. A Clean Architecture deixa as fronteiras internas explícitas, de modo que extrair um serviço depois seria mecânico. **Citar a Aula 2 explicitamente na seção de Arquitetura do relatório** — demonstrar critério de escolha vale mais que aplicar o padrão da moda.

---

## 2. Clean Architecture — estrutura da API

A regra de dependência aponta para dentro: **domínio não conhece ninguém; casos de uso conhecem o domínio; a infraestrutura conhece os casos de uso; nada de fora entra no domínio.**

```
api/src/
├── domain/                        SEM express, SEM mongoose, SEM libs externas
│   ├── entities/
│   │   ├── Ocorrencia.js          regras de transição de status, regra da avaliação
│   │   └── Usuario.js             regras de perfil
│   └── errors/
│       ├── DomainError.js
│       ├── TransicaoInvalidaError.js
│       └── NaoAutorizadoError.js
│
├── application/                   orquestra o domínio; depende só de portas
│   ├── ports/                     contratos (interfaces) implementados pela infra
│   │   ├── OcorrenciaRepository.js
│   │   ├── HistoricoRepository.js
│   │   ├── UsuarioRepository.js
│   │   ├── ComentarioRepository.js
│   │   ├── ArmazenamentoImagem.js
│   │   ├── Hasher.js
│   │   └── TokenService.js
│   └── usecases/
│       ├── RegistrarUsuario.js         AutenticarUsuario.js
│       ├── RegistrarOcorrencia.js      ListarOcorrencias.js
│       ├── ObterOcorrencia.js          AlterarStatusOcorrencia.js
│       ├── AlterarPrioridade.js        AtribuirResponsavel.js
│       ├── RegistrarSolucao.js         AvaliarResolucao.js
│       ├── ComentarOcorrencia.js       ObterIndicadores.js
│
├── infrastructure/                detalhes substituíveis
│   ├── database/mongoose/
│   │   ├── schemas/               UsuarioSchema, OcorrenciaSchema,
│   │   │                          HistoricoStatusSchema, ComentarioSchema
│   │   └── repositories/          implementam as portas
│   ├── storage/CloudinaryArmazenamentoImagem.js
│   ├── security/BcryptHasher.js   security/JwtTokenService.js
│   └── config/db.js
│
├── interfaces/http/               adaptadores de entrada
│   ├── controllers/               traduzem HTTP ↔ caso de uso. SEM regra de negócio
│   ├── routes/                    um arquivo por recurso
│   └── middlewares/               auth.js, requirePerfil.js, upload.js, errorHandler.js
│
└── main/
    ├── container.js               injeção de dependência — instancia e liga tudo
    ├── app.js                     monta o Express
    └── server.js                  sobe o servidor
```

**Três regras que o agente de código não pode violar:**

1. Nenhum arquivo em `domain/` ou `application/` faz `require` de `express`, `mongoose`, `jsonwebtoken`, `bcryptjs` ou `cloudinary`.
2. Caso de uso recebe suas dependências pelo construtor, sempre. Quem instancia é o `container.js`.
3. Controller não tem `if` de regra de negócio. Ele traduz requisição em chamada de caso de uso e resultado em resposta HTTP.

**Benefício concreto para os testes:** os casos de uso são testáveis com repositórios falsos em memória, sem subir Mongo. É isso que torna a suíte rápida e o pipeline confiável.

---

## 3. Modelos de dados

### `Usuario`

| Campo | Tipo | Regra |
|---|---|---|
| `nome` | String | obrigatório |
| `email` | String | obrigatório, único, lowercase |
| `senha` | String | hash bcrypt, `select: false` |
| `perfil` | String | enum `['solicitante','gestor']`, default `'solicitante'` |
| `createdAt` | Date | default now |

### `Ocorrencia`

| Campo | Tipo | Regra |
|---|---|---|
| `titulo` | String | obrigatório |
| `descricao` | String | obrigatório |
| `categoria` | String | enum `['iluminacao','equipamento','acessibilidade','limpeza','vazamento','seguranca','manutencao','outros']` |
| `localizacao` | String | obrigatório, texto livre |
| `imagemUrl` | String | opcional, URL do Cloudinary |
| `prioridade` | String | enum `['baixa','media','alta']`, default `'media'` |
| `status` | String | enum `['aberta','em_analise','em_atendimento','resolvida','cancelada']`, default `'aberta'` |
| `solicitante` | ObjectId → Usuario | obrigatório |
| `responsavel` | ObjectId → Usuario | opcional |
| `solucaoAplicada` | String | opcional |
| `avaliacao` | `{nota: 1–5, comentario, data}` | opcional |
| `resolvidaEm` | Date | preenchida na transição para `resolvida` — base do tempo médio |
| timestamps | | `timestamps: true` |

### `HistoricoStatus`

Coleção própria — é auditada isoladamente.

| Campo | Tipo |
|---|---|
| `ocorrencia` | ObjectId → Ocorrencia, obrigatório, indexado |
| `statusAnterior` | String (`null` no registro de abertura) |
| `statusNovo` | String, obrigatório |
| `usuario` | ObjectId → Usuario, obrigatório |
| `observacao` | String |
| `data` | Date, default now |

### `Comentario`

`ocorrencia` (ref, indexado) · `autor` (ref) · `texto` · `data`

---

## 4. Máquina de estados — regra do domínio

Mora em `domain/entities/Ocorrencia.js`, não no controller.

```
aberta ──→ em_analise ──→ em_atendimento ──→ resolvida
   │            │                │
   └────────────┴────────────────┴──→ cancelada
```

| De | Para permitido |
|---|---|
| `aberta` | `em_analise`, `cancelada` |
| `em_analise` | `em_atendimento`, `cancelada` |
| `em_atendimento` | `resolvida`, `cancelada` |
| `resolvida` / `cancelada` | — (finais) |

Transição inválida lança `TransicaoInvalidaError`, que o `errorHandler` traduz em **409**.

**Regra de ouro da auditoria:** o caso de uso `AlterarStatusOcorrencia` grava o `HistoricoStatus` na mesma operação em que altera o status. Nunca em rota separada, nunca no front. Na criação, `RegistrarOcorrencia` grava o registro de abertura com `statusAnterior: null`.

---

## 5. Contrato da API

Base `/api`. Tudo exceto `registrar` e `login` exige `Authorization: Bearer <token>`.

| Método | Rota | Perfil | Observação |
|---|---|---|---|
| POST | `/auth/registrar` | público | `{nome,email,senha,perfil}` → 201 `{token,usuario}` |
| POST | `/auth/login` | público | → 200 `{token,usuario}` |
| GET | `/auth/eu` | autenticado | |
| GET | `/health` | público | usado pelo Web App e pelo pipeline |
| POST | `/ocorrencias` | solicitante | `multipart/form-data`, campo `imagem`. Cria em `aberta` e grava histórico de abertura |
| GET | `/ocorrencias` | ambos | solicitante vê só as suas. Query: `categoria`, `status`, `prioridade`, `page`, `limit` |
| GET | `/ocorrencias/:id` | dono ou gestor | ocorrência + comentários + histórico |
| PATCH | `/ocorrencias/:id/status` | gestor | `{status, observacao}` — valida transição, grava histórico |
| PATCH | `/ocorrencias/:id/prioridade` | gestor | `{prioridade}` |
| PATCH | `/ocorrencias/:id/responsavel` | gestor | `{responsavelId}` |
| PATCH | `/ocorrencias/:id/solucao` | gestor | `{solucaoAplicada}` |
| POST | `/ocorrencias/:id/avaliacao` | solicitante dono | `{nota, comentario}` — só se `resolvida`, senão 409 |
| GET | `/ocorrencias/:id/historico` | dono ou gestor | ordenado por data |
| POST/GET | `/ocorrencias/:id/comentarios` | dono ou gestor | |
| GET | `/dashboard` | gestor | `{porStatus, porCategoria, porPrioridade, tempoMedioResolucaoHoras, avaliacaoMedia, total}` |
| GET | `/usuarios?perfil=gestor` | gestor | popula o seletor de responsável |

**Erros:** `400` validação · `401` token ausente ou inválido · `403` perfil sem permissão · `404` não encontrado · `409` transição inválida ou avaliação fora de hora.

---

## 6. Telas (React)

| Rota | Perfil | Conteúdo |
|---|---|---|
| `/registrar` · `/login` | público | |
| `/` | solicitante | Minhas ocorrências, cards com status, botão Nova |
| `/ocorrencias/nova` | solicitante | título, descrição, categoria, localização, upload |
| `/ocorrencias/:id` | ambos | detalhe · **timeline do histórico** · comentários · avaliação se `resolvida` · ações do gestor |
| `/painel` | gestor | tabela com filtros de categoria, status e prioridade |
| `/dashboard` | gestor | cartões de indicadores + 2 gráficos Recharts |

Reaproveitar da Fase 3: `Navbar`, `PrivateRoute` (agora com perfil), camada `services/` com uma função por endpoint, `AuthContext` no padrão da Fase 4.

A **timeline do histórico** é o que prova visualmente a auditabilidade — é o ponto alto do vídeo. Capriche nela mais que em qualquer outra tela.

---

## 7. Testes (Jest + Supertest)

| Arquivo | Tipo | Casos |
|---|---|---|
| `usecases/AlterarStatus.test.js` | unitário, repositórios falsos | transição válida grava histórico · inválida lança erro · solicitante não pode |
| `usecases/AvaliarResolucao.test.js` | unitário | avaliar não resolvida falha · resolvida funciona · só o dono avalia |
| `http/auth.test.js` | integração | registro hasheia senha · login devolve token · token inválido → 401 |
| `http/ocorrencia.test.js` | integração | criar → 201 e `aberta` · criar grava histórico · solicitante não vê a dos outros · filtro por status |

Os dois primeiros rodam sem banco — é o retorno prático da Clean Architecture, e é o que mantém o pipeline rápido.

---

## 8. Variáveis de ambiente

**`api/.env`**
```
MONGODB_URI=
PORT=3000
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CORS_ORIGIN=http://localhost:5173
```

**`web/.env`**
```
VITE_API_URL=http://localhost:3000/api
```

Em produção as mesmas variáveis vão em **Application Settings do Web App** (nunca no repositório), e `VITE_API_URL` aponta para a URL do Web App.

---

## 9. Documentação exigida pelo enunciado

| Item | Onde |
|---|---|
| Arquitetura de software | `docs/ARQUITETURA.md` — diagramas Mermaid de camadas, estados e dados, **mais a justificativa monolito × microsserviços** |
| README com setup e stack | `README.md` |
| Documentação da API | `docs/postman/` + Azure Artifacts, se sobrar tempo |
| Wiki do projeto | **Azure Wiki** (Aula 2) — espelhar o README lá rende coerência com a fase |
| Processo | **Azure Boards** com as tarefas do plano — é evidência de processo para o relatório |
