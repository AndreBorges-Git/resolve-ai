# Entrega — Resolve Aí

Documento de fechamento do hackathon. Reúne o que a banca precisa para avaliar:
os links, o checklist das capacidades exigidas com a evidência de cada uma, o
roteiro do pitch e as dívidas declaradas.

---

## 1. Links da entrega

| O quê | Link |
|---|---|
| Repositório | https://github.com/AndreBorges-Git/resolve-ai |
| Aplicação (front) | _a publicar_ |
| API | _a publicar_ |
| Vídeo do MVP | _a publicar_ |
| Vídeo do pitch | _a publicar_ |
| Pasta pública no Drive | _a publicar_ |

Credenciais de demonstração (todas com a senha `Senha123`):

| Perfil | E-mail |
|---|---|
| Gestor | `gestor@resolveai.com` |
| Solicitante | `marina@resolveai.com` |
| Solicitante | `joao@resolveai.com` |

---

## 2. Checklist das 18 capacidades

Cada linha aponta onde a capacidade está implementada, para a banca conferir sem
caçar no código.

### Solicitante

| # | Capacidade | Onde | ✓ |
|---|---|---|---|
| 1 | Criar uma conta | `POST /api/auth/registrar` · `web/src/pages/Registro.jsx` | ✅ |
| 2 | Autenticar-se | `POST /api/auth/login` · JWT em `JwtTokenService` | ✅ |
| 3 | Registrar uma ocorrência | `POST /api/ocorrencias` · `RegistrarOcorrencia.js` | ✅ |
| 4 | Título, descrição e categoria | validados em `domain/entities/Ocorrencia.js` | ✅ |
| 5 | Informar localização | campo obrigatório na mesma entidade | ✅ |
| 6 | Anexar uma imagem | `imagemOpcional('imagem')` → Cloudinary | ✅ |
| 7 | Acompanhar o andamento | `GET /api/ocorrencias` · `MinhasOcorrencias.jsx` | ✅ |
| 8 | Adicionar comentários | `POST /api/ocorrencias/:id/comentarios` | ✅ |
| 9 | Consultar o histórico | `GET /api/ocorrencias/:id/historico` · `Timeline.jsx` | ✅ |
| 10 | Avaliar a resolução | `POST /api/ocorrencias/:id/avaliacao` (só dono, só resolvida) | ✅ |

### Gestor

| # | Capacidade | Onde | ✓ |
|---|---|---|---|
| 11 | Visualizar todas | `GET /api/ocorrencias` sem recorte por dono | ✅ |
| 12 | Filtrar por categoria, status e prioridade | query da listagem · `PainelGestor.jsx` | ✅ |
| 13 | Alterar prioridade | `PATCH /api/ocorrencias/:id/prioridade` | ✅ |
| 14 | Atribuir responsável | `PATCH /api/ocorrencias/:id/responsavel` | ✅ |
| 15 | Atualizar status | `PATCH /api/ocorrencias/:id/status` + auditoria atômica | ✅ |
| 16 | Adicionar comentários | mesma rota do solicitante, sem recorte de posse | ✅ |
| 17 | Registrar a solução aplicada | `PATCH /api/ocorrencias/:id/solucao` | ✅ |
| 18 | Dashboard de indicadores | `GET /api/dashboard` · `Dashboard.jsx` (Recharts) | ✅ |

### Camadas exigidas

| Camada | Evidência | ✓ |
|---|---|---|
| Arquitetura documentada e justificada | `docs/ARQUITETURA.md` — regra de dependência, portas, monolito × microsserviços | ✅ |
| Backend | Node 22 + Express, Clean Architecture em quatro camadas | ✅ |
| APIs | REST documentada no `README.md` e na coleção Postman | ✅ |
| Banco | MongoDB + Mongoose, quatro coleções | ✅ |
| Frontend | React 19 + Vite + styled-components | ✅ |
| Testes | 96 testes em 14 suítes, `npm test` — rodam sem banco e sem rede | ✅ |
| Docker | `docker-compose.yml` sobe mongo, api e web | ✅ |
| Deploy em Cloud | Azure Web App for Containers + ACR — **pendente das credenciais** | ⏳ |
| Documentação | `README.md`, `docs/`, um `README.md` por camada da API | ✅ |

**Pendência única:** o deploy em nuvem depende de contas que só o autor pode criar
(MongoDB Atlas, Cloudinary e a assinatura Azure). O pipeline
(`azure-pipelines.yml`) e o `Dockerfile` de produção já estão versionados.

---

## 3. Roteiro do pitch (5 a 7 minutos)

**1. O problema (45s).**
Ocorrência do dia a dia — um poste apagado, um vazamento na calçada — hoje vira
mensagem de WhatsApp. Some no meio da conversa. Ninguém sabe quem ficou
responsável, nem quando mudou de mão, nem por quê. Quem abriu nunca recebe
retorno. Quem gere não tem número nenhum para decidir onde colocar equipe.

**2. A solução (45s).**
Resolve Aí: solicitante registra, gestor conduz até a resolução, e **cada mudança
de status fica registrada** — de qual estado para qual, quando, por quem, com
observação. O produto não é o formulário; é a trilha.

**3. Demonstração curta (2min).**
Uma ocorrência do começo ao fim: registro com foto e localização → gestor
prioriza, atribui responsável e move pelos estados → **a timeline** → solução
aplicada → avaliação do solicitante → dashboard. Se o tempo apertar, corte tudo
menos a timeline e o dashboard.

**4. Arquitetura (1min30).**
Clean Architecture com a regra de dependência apontando para dentro: o domínio
não conhece Express nem Mongoose, e há um teste que **quebra a build** se alguém
tentar. A máquina de estados mora na entidade, não no controller nem no front —
por isso `aberta → resolvida` é recusada com 409 venha de onde vier. A auditoria
é escrita na mesma operação da mudança de status, com desfazimento se a segunda
escrita falhar. Monolito modular por escolha justificada, não por falta de
opção: as fronteiras já estão desenhadas se um dia precisarem virar serviços.

**5. Próximos passos (45s).**
As dívidas da seção 4 — declaradas de propósito. Notificação por e-mail e
auditoria de prioridade e responsável são as duas primeiras da fila, porque
completam a promessa de rastreio que o produto faz.

**Antes de gravar:** aqueça a URL, rode `npm run seed`, feche as abas extras.

---

## 4. Dívidas conhecidas

Declaradas porque limitação conhecida é sinal de maturidade técnica, não de
projeto incompleto:

- notificação por e-mail ao solicitante a cada mudança de status;
- anexar mais de uma imagem por ocorrência;
- histórico de alteração de prioridade e responsável — hoje só o status é auditado;
- busca textual por título e descrição;
- exportação de relatórios;
- testes end-to-end;
- observabilidade (log estruturado, métricas, rastreio distribuído).
