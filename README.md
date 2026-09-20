# Resolve Aí — Plataforma de Gestão de Ocorrências

Hackathon — Pós-graduação FIAP Full Stack Development (6FSDT, Fase 5).
Autor: **André Borges** · RM365669

Solicitantes registram problemas do dia a dia — iluminação, vazamento, limpeza,
segurança, manutenção — e gestores acompanham cada um até a resolução, com
**trilha de auditoria de toda mudança de status**.

## Links

- **Repositório:** https://github.com/AndreBorges-Git/resolve-ai
- **Aplicação (front):** _a publicar_
- **API:** _a publicar_
- **Arquitetura:** [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md)

## Credenciais de demonstração

Criadas pelo seed (`npm run seed`). A senha é a mesma para os três:

| Perfil | E-mail | Senha |
|---|---|---|
| Gestor | `gestor@resolveai.com` | `Senha123` |
| Solicitante | `marina@resolveai.com` | `Senha123` |
| Solicitante | `joao@resolveai.com` | `Senha123` |

O seed cria 8 ocorrências espalhadas pelos cinco status, com datas de dias
diferentes. A ocorrência **"Vazamento de água na calçada da Rua Aurora"** tem a
trilha completa das quatro transições, solução registrada e avaliação — é a que
mostra o produto inteiro numa tela só.

## O problema

Condomínios, empresas e bairros recebem solicitações por mensagem, e-mail e
conversa informal. Sem registro estruturado não há priorização, não há
responsável definido e não há como auditar o que foi feito. O Resolve Aí dá a
essas ocorrências um ciclo de vida rastreável, do registro à avaliação da
resolução.

## Perfis

- **Solicitante** — cria conta, registra ocorrências com foto e localização,
  acompanha o andamento, comenta, consulta o histórico e avalia a resolução.
- **Gestor** — vê todas as ocorrências, filtra por categoria, status e
  prioridade, prioriza, atribui responsável, move o status com observação,
  registra a solução aplicada e acompanha os indicadores no dashboard.

Um solicitante só enxerga e mexe nas próprias ocorrências. O dashboard é
exclusivo do gestor.

## Ciclo de vida

```
aberta → em análise → em atendimento → resolvida
   └──────────┴────────────────┴──────→ cancelada
```

`resolvida` e `cancelada` são finais. **Toda transição grava um registro de
auditoria** com status anterior, status novo, data e hora, usuário responsável e
observação — inclusive a abertura, registrada com status anterior nulo. A
gravação acontece dentro do mesmo caso de uso que muda o status: não existe
caminho no sistema que altere status sem deixar rastro.

Transição fora dessas setas responde **409**.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js 22 + Express 5 (CommonJS) |
| Banco | MongoDB + Mongoose |
| Autenticação | JWT + bcryptjs |
| Frontend | React 19 + Vite + React Router + styled-components |
| Gráficos | Recharts |
| Imagens | Cloudinary |
| Testes | Jest + Supertest |
| Container | Docker + Docker Compose |
| CI | GitHub Actions / Azure Pipelines |

A stack espelha as Fases 2, 3 e 4 do curso de propósito: continuidade é
argumento, não acaso.

## Arquitetura

**Clean Architecture.** A regra de dependência aponta para dentro:

```
interfaces/http  →  application  →  domain
infrastructure   →  application  →  domain
main             →  conhece todos (só ele)
```

```
api/src/
├── domain/          entities/ errors/          — sem libs externas
├── application/     ports/ usecases/           — depende só de domain + ports
├── infrastructure/  database/ storage/ security/ config/
├── interfaces/http/ controllers/ routes/ middlewares/
└── main/            container.js app.js server.js
```

O domínio não conhece Express nem Mongoose — e isso é **verificado por teste**:
`tests/arquitetura.test.js` lê o código-fonte e falha o build se encontrar um
`require` de biblioteca externa em `domain/` ou `application/`.

Diagramas, modelo de dados e a justificativa de monolito × microsserviços em
[`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

## Como rodar

### Com Docker (recomendado)

```bash
cp api/.env.example api/.env    # preencher JWT_SECRET e as chaves do Cloudinary
cp web/.env.example web/.env
docker compose up --build
```

Front em http://localhost:5173 · API em http://localhost:3000/api

O compose sobe Mongo, API e front. Ele **não monta volumes de código**: a imagem
que roda localmente é a mesma que vai para a nuvem, então mudanças no código
pedem `docker compose up --build`.

### Sem Docker

```bash
cd api && npm install && npm run dev     # precisa de um Mongo acessível
cd web && npm install && npm run dev
```

### Popular com dados de demonstração

```bash
cd api && npm run seed
```

⚠️ O seed **limpa as quatro coleções** antes de recriar tudo — ele é idempotente,
não incremental. Não aponte para um banco com dados que você queira manter.

## Variáveis de ambiente

`api/.env`:

| Variável | Para quê |
|---|---|
| `MONGODB_URI` | string de conexão do MongoDB |
| `PORT` | porta da API (padrão 3000) |
| `JWT_SECRET` | segredo de assinatura do token |
| `CLOUDINARY_CLOUD_NAME` · `CLOUDINARY_API_KEY` · `CLOUDINARY_API_SECRET` | upload de imagens |
| `CORS_ORIGIN` | origem do front autorizada |

`web/.env`:

| Variável | Para quê |
|---|---|
| `VITE_API_URL` | URL base da API (ex.: `http://localhost:3000/api`) |

Nenhum segredo vai para o repositório — apenas os `.env.example` com as chaves
vazias.

## Testes

```bash
cd api && npm test          # 96 testes
cd api && npm run test:cov  # com cobertura
```

A suíte inteira roda **sem banco e sem rede**: os testes de caso de uso usam
repositórios falsos em memória e os de HTTP sobem o mesmo Express com um
container de falsos, via `criarApp(container)`.

## API

Todas as rotas sob `/api`. Autenticação por `Authorization: Bearer <token>`.

### Autenticação

| Método | Rota | Quem | O quê |
|---|---|---|---|
| `POST` | `/auth/registrar` | público | cria conta e já devolve token |
| `POST` | `/auth/login` | público | autentica |
| `GET` | `/auth/eu` | autenticado | dados do usuário do token |

### Ocorrências

| Método | Rota | Quem | O quê |
|---|---|---|---|
| `POST` | `/ocorrencias` | autenticado | registra (aceita `multipart/form-data` com `imagem`) |
| `GET` | `/ocorrencias` | autenticado | lista com filtros `categoria`, `status`, `prioridade`, `page`, `limit` |
| `GET` | `/ocorrencias/:id` | autenticado | detalhe com histórico e comentários |
| `PATCH` | `/ocorrencias/:id/status` | gestor | move o status e **grava a auditoria** |
| `PATCH` | `/ocorrencias/:id/prioridade` | gestor | altera a prioridade |
| `PATCH` | `/ocorrencias/:id/responsavel` | gestor | atribui responsável |
| `PATCH` | `/ocorrencias/:id/solucao` | gestor | registra `solucaoAplicada` |
| `POST` | `/ocorrencias/:id/avaliacao` | solicitante dono | avalia (nota 1–5), só se `resolvida` |
| `GET` | `/ocorrencias/:id/historico` | autenticado | trilha de auditoria |
| `POST` · `GET` | `/ocorrencias/:id/comentarios` | autenticado | comenta / lista comentários |

### Apoio

| Método | Rota | Quem | O quê |
|---|---|---|---|
| `GET` | `/dashboard` | gestor | indicadores agregados |
| `GET` | `/usuarios` | gestor | lista usuários (filtro `perfil`) |
| `GET` | `/health` | público | verificação de vida |

### Códigos de resposta

| Código | Quando |
|---|---|
| `400` | payload inválido |
| `401` | sem token ou token inválido |
| `403` | perfil sem permissão para a ação |
| `404` | recurso inexistente |
| `409` | transição de status inválida, avaliação fora de hora ou repetida |

Coleção Postman em [`docs/postman/`](docs/postman/).

## Documentação do projeto

| Documento | Conteúdo |
|---|---|
| [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) | camadas, máquina de estados, modelo de dados, deploy, monolito × microsserviços |
| [`docs/ESPEC-TECNICA.md`](docs/ESPEC-TECNICA.md) | contrato de implementação |
| [`docs/DESAFIO-RESOLVE-AI.md`](docs/DESAFIO-RESOLVE-AI.md) | requisitos oficiais do hackathon |
| [`docs/PLANO-9-DIAS.md`](docs/PLANO-9-DIAS.md) | cronograma e decisões |
| [`docs/BACKLOG.md`](docs/BACKLOG.md) | tarefas por dia |
