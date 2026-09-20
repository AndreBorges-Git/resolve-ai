# Resolve Aí — Backlog executável

Tarefas na ordem de execução, com **prompts prontos para colar no Claude Code**.
Cronograma em `PLANO-9-DIAS.md` · contrato em `ESPEC-TECNICA.md`.

Regra de uso: cole um prompt por vez, confira o resultado, faça commit, passe ao próximo.
Não cole dois dias de uma vez — o agente perde o fio e você perde o controle da revisão.

---

## D1 — domingo 20/09 · infra no ar (4h)

### Fora do Claude Code (você faz)

- [ ] **Azure for Students** em `azure.microsoft.com/free/students` com o e-mail `rm365669@fiap.com.br`
- [ ] **Azure DevOps** em `dev.azure.com`: criar organização e projeto `resolve-ai`
- [ ] **Solicitar a concessão do job paralelo gratuito** — leva dias úteis, pedir hoje
- [ ] **MongoDB Atlas**: cluster M0, usuário/senha, Network Access `0.0.0.0/0`, copiar a connection string
- [ ] **Cloudinary**: conta free, copiar Cloud Name, API Key e API Secret
- [ ] **GitHub**: criar o repositório e dar push do que já existe
- [ ] **22h — ponto de decisão de nuvem:** Azure ativo? Caminho A. Senão, Caminho B (Render + Vercel)
- [ ] Publicar API e front na nuvem escolhida, com `/health` respondendo

### No Claude Code

```
Leia CLAUDE.md, ../ESPEC-TECNICA.md e os READMEs em api/src/*/.

Tarefa 1 — inicializar os dois projetos:
- Em api/: npm init, instalar express mongoose jsonwebtoken bcryptjs cors dotenv
  multer cloudinary, e como dev jest supertest nodemon. Scripts: start, dev, test, test:cov.
- Em web/: criar projeto Vite React e instalar react-router-dom axios styled-components recharts.

Tarefa 2 — esqueleto mínimo que sobe:
- api/src/main/app.js: Express com cors, express.json(), rota GET /api/health devolvendo
  { status: 'ok', timestamp }, e o errorHandler no fim.
- api/src/main/server.js: conecta no Mongo via infrastructure/config/db.js e sobe na porta do .env.
- api/src/interfaces/http/middlewares/errorHandler.js: traduz TransicaoInvalidaError -> 409,
  NaoAutorizadoError -> 403, erro de validacao -> 400, resto -> 500. Nunca vaza stack em producao.
- web: App.jsx com React Router e duas rotas vazias, /login e /.

Nao crie nada alem disso. Ao terminar, rode docker-compose up e confirme que
http://localhost:3000/api/health responde.
```

**Pronto quando:** `/api/health` responde local **e** na URL pública.

---

## D2 — segunda 21/09 · domínio e autenticação (2h)

```
Implemente a camada de dominio e a autenticacao, seguindo a regra de dependencia do CLAUDE.md.

1. domain/errors/: DomainError (base), TransicaoInvalidaError, NaoAutorizadoError,
   ValidacaoError. Todos com name proprio.

2. domain/entities/Usuario.js: entidade pura com nome, email, senha (hash), perfil.
   Metodo estatico PERFIS = ['solicitante','gestor']. Metodo ehGestor().

3. application/ports/: classes-contrato UsuarioRepository, Hasher, TokenService.
   Cada metodo lanca new Error('nao implementado').

4. infrastructure/database/mongoose/schemas/UsuarioSchema.js e
   repositories/UsuarioRepositoryMongoose.js implementando a porta.
   Repositorio devolve objetos simples, nao documentos Mongoose.

5. infrastructure/security/BcryptHasher.js e JwtTokenService.js implementando as portas.

6. application/usecases/RegistrarUsuario.js e AutenticarUsuario.js. Dependencias pelo
   construtor. RegistrarUsuario rejeita email duplicado com ValidacaoError.

7. interfaces/http/: authController, authRoutes (POST /registrar, POST /login, GET /eu),
   middlewares/auth.js (valida JWT, popula req.usuario) e requirePerfil.js.

8. main/container.js: instancia tudo e exporta. app.js passa a montar authRoutes.

9. Testes: tests/usecases/RegistrarUsuario.test.js e AutenticarUsuario.test.js usando
   um UsuarioRepository falso em memoria em tests/helpers/. Sem banco.
   tests/http/auth.test.js com Supertest.
```

**Pronto quando:** `npm test` passa e dá para registrar e logar via Postman na URL pública.

---

## D3 — terça 22/09 · ocorrências e upload (2h)

```
Implemente o registro e a listagem de ocorrencias, com upload de imagem.

1. domain/entities/Ocorrencia.js: entidade pura com todos os campos da ESPEC-TECNICA secao 3.
   Constantes STATUS, CATEGORIAS, PRIORIDADES. Por enquanto so a criacao; a maquina de
   estados entra no D4.

2. application/ports/: OcorrenciaRepository, HistoricoRepository, ArmazenamentoImagem.

3. infrastructure/: OcorrenciaSchema, HistoricoStatusSchema, os dois repositorios Mongoose,
   e storage/CloudinaryArmazenamentoImagem.js implementando ArmazenamentoImagem.

4. application/usecases/RegistrarOcorrencia.js — ponto critico: cria a ocorrencia com
   status 'aberta' E grava o HistoricoStatus de abertura com statusAnterior null,
   na mesma operacao. Se o upload falhar, a ocorrencia nao e criada.

5. application/usecases/ListarOcorrencias.js: se o usuario e solicitante, filtra pelas
   proprias; se e gestor, lista todas. Aceita filtros categoria, status, prioridade e
   paginacao page/limit.

6. application/usecases/ObterOcorrencia.js: devolve ocorrencia + comentarios + historico.
   Solicitante que nao e dono recebe NaoAutorizadoError.

7. interfaces/http/: middlewares/upload.js com multer em memoria (limite 5MB, so imagem),
   ocorrenciaController, ocorrenciaRoutes com POST /ocorrencias (multipart, campo 'imagem'),
   GET /ocorrencias, GET /ocorrencias/:id.

8. Testes: tests/usecases/RegistrarOcorrencia.test.js — verifica que o historico de
   abertura foi gravado. tests/http/ocorrencia.test.js — 201, status aberta,
   solicitante nao ve a dos outros, filtro por status.
```

**Pronto quando:** upload funciona **em produção**, não só local. Teste pela URL pública.

---

## D4 — quarta 23/09 · status, auditoria e comentários (2h)

```
Implemente a maquina de estados com trilha de auditoria. E o requisito mais destacado
do enunciado.

1. domain/entities/Ocorrencia.js: acrescente
   - TRANSICOES = { aberta: ['em_analise','cancelada'], em_analise: ['em_atendimento','cancelada'],
     em_atendimento: ['resolvida','cancelada'], resolvida: [], cancelada: [] }
   - podeTransicionarPara(novoStatus) -> boolean
   - alterarStatus(novoStatus) -> lanca TransicaoInvalidaError se invalido; se o novo
     status for 'resolvida', preenche resolvidaEm com a data atual.

2. application/usecases/AlterarStatusOcorrencia.js:
   - so gestor (senao NaoAutorizadoError)
   - carrega a ocorrencia, chama alterarStatus na ENTIDADE (a regra e do dominio,
     nao do caso de uso)
   - persiste a ocorrencia E grava o HistoricoStatus com statusAnterior, statusNovo,
     usuario, observacao e data, na mesma operacao
   - devolve a ocorrencia atualizada

3. application/usecases/ComentarOcorrencia.js e ListarComentarios.js: dono ou gestor.
   Porta e repositorio de Comentario.

4. interfaces/http/: PATCH /ocorrencias/:id/status com requirePerfil('gestor'),
   GET /ocorrencias/:id/historico, POST e GET /ocorrencias/:id/comentarios.

5. Testes, em tests/usecases/AlterarStatus.test.js, com repositorios falsos:
   - aberta -> em_analise grava historico com statusAnterior 'aberta'
   - aberta -> resolvida lanca TransicaoInvalidaError
   - resolvida -> qualquer coisa lanca TransicaoInvalidaError
   - solicitante tentando alterar lanca NaoAutorizadoError
   - transicao para resolvida preenche resolvidaEm
```

**Pronto quando:** os cinco testes de transição passam. Esse é o coração da nota.

---

## D5 — quinta 24/09 · fechar o backend (2h)

```
Complete a API.

1. usecases AlterarPrioridade, AtribuirResponsavel e RegistrarSolucao — todos so gestor.
   AtribuirResponsavel valida que o responsavel existe e tem perfil gestor.

2. usecases/AvaliarResolucao.js: so o solicitante DONO, e so se status === 'resolvida',
   senao TransicaoInvalidaError (409). Nota de 1 a 5, comentario opcional.

3. usecases/ObterIndicadores.js (so gestor): agregacao devolvendo
   { total, porStatus, porCategoria, porPrioridade, tempoMedioResolucaoHoras, avaliacaoMedia }.
   Tempo medio: media de (resolvidaEm - createdAt) apenas das ocorrencias com resolvidaEm.

4. usecases/ListarUsuarios.js filtrando por perfil, para o seletor de responsavel.

5. Rotas: PATCH prioridade, responsavel e solucao; POST avaliacao;
   GET /dashboard; GET /usuarios?perfil=gestor.

6. tests/usecases/AvaliarResolucao.test.js: nao resolvida -> erro; resolvida -> ok;
   quem nao e dono -> NaoAutorizadoError.

7. Rode npm run test:cov e me mostre o resumo da cobertura.
```

**🔒 Backend fechado.** Todos os 18 requisitos acessíveis por API.

---

## D6 — sexta 25/09 · front, parte 1 (2h)

```
Implemente o front base seguindo o padrao das Fases 3 e 4.

1. web/src/services/api.js: instancia Axios com baseURL de VITE_API_URL e interceptor
   que injeta o Bearer token.
2. web/src/services/: um arquivo por recurso (auth.js, ocorrencias.js, dashboard.js),
   uma funcao por endpoint.
3. web/src/context/AuthContext.jsx: login, logout, usuario, token em localStorage,
   ehGestor. Padrao do AuthContext da Fase 4.
4. web/src/components/: Navbar (mostra itens conforme o perfil), PrivateRoute
   (aceita prop perfil para restringir), Button, Input, EmptyState, StatusBadge
   (cores por status), CategoriaBadge.
5. web/src/styles/: tema com styled-components — paleta, espacamentos, tipografia.
6. Paginas: Login, Registro (com seletor de perfil), MinhasOcorrencias (cards com
   titulo, categoria, StatusBadge e data), NovaOcorrencia (titulo, descricao,
   categoria, localizacao, upload com preview).
7. Rotas no App.jsx, com PrivateRoute onde preciso.

Sem CSS elaborado: limpo e legivel. Funcional vale mais que bonito nesta etapa.
```

---

## D7 — sábado 26/09 · front, parte 2 (5h) · 🔒 congelamento às 23h59

```
Implemente as telas que fecham o MVP.

1. Pagina DetalheOcorrencia (/ocorrencias/:id) — a tela mais importante do projeto:
   - cabecalho com titulo, StatusBadge, categoria, prioridade, localizacao, imagem
   - componente Timeline: lista vertical do historico, cada item mostrando
     "de X para Y", data e hora, usuario responsavel e a observacao.
     E a prova visual da auditabilidade e o ponto alto do video. Capriche.
   - secao de comentarios com formulario
   - se status resolvida e o usuario e o dono: bloco de avaliacao com estrelas 1-5
   - se o usuario e gestor: painel de acoes com select de status (mostrando so as
     transicoes validas), observacao obrigatoria ao mudar status, select de prioridade,
     select de responsavel e campo de solucao aplicada

2. Pagina PainelGestor (/painel): tabela com todas as ocorrencias, filtros de categoria,
   status e prioridade combinaveis, paginacao, link para o detalhe.

3. Pagina Dashboard (/dashboard): quatro cartoes (total, abertas, em atendimento,
   resolvidas), tempo medio de resolucao, avaliacao media, e dois graficos Recharts —
   barras por categoria e pizza por status.

Se o tempo apertar, corte os graficos Recharts e deixe so os cartoes numericos.
```

---

## D8 — domingo 27/09 · documentação e vídeo (4h)

```
1. api/scripts/seed.js: cria 1 gestor (gestor@resolveai.com / Senha123), 2 solicitantes
   e 8 ocorrencias espalhadas pelos cinco status e por categorias diferentes.
   Uma delas resolvida, com avaliacao e historico completo das quatro transicoes,
   com datas espacadas em dias para o tempo medio fazer sentido. Uma cancelada.
   Script idempotente: limpa as colecoes antes.

2. README.md: preencher URLs de producao, stack, arquitetura, como rodar, como testar,
   credenciais de demonstracao. Se a API estiver no Render, avisar sobre a hibernacao.

3. docs/ARQUITETURA.md: completar os diagramas Mermaid (camadas da Clean Architecture,
   maquina de estados, modelo de dados, topologia de deploy) e escrever a
   justificativa monolito x microsservicos citando a Aula 2 do modulo de Microsservicos.

4. Varra o caminho feliz inteiro procurando bug e me liste o que encontrar.
```

**Feito:** seed, README, `docs/ARQUITETURA.md` e a coleção Postman em `docs/postman/` (commit `c9e6f9c`). A varredura do caminho feliz achou dois defeitos, ambos corrigidos: o gestor não via a avaliação do solicitante, e as mensagens de erro saíam sem acento.

**Depois, sem o agente:** **gravar o vídeo do MVP** seguindo o roteiro da seção 7 do plano. Aquecer a URL antes.

---

## D9 — segunda 28/09 · pitch e entrega (3h)

- [x] Roteiro do pitch: problema, solução, demonstração curta, arquitetura, próximos passos — `docs/ENTREGA.md`, seção 3
- [ ] Gravar o vídeo do pitch
- [ ] Subir os dois vídeos no Drive, pasta pública
- [x] Documento de submissão com os links: Drive, repositório, aplicação, API — `docs/ENTREGA.md`, seção 1 (faltam as URLs)
- [x] Revisar o checklist das 18 capacidades da seção 4 do plano — `docs/ENTREGA.md`, seção 2: 17 de 18 prontas, só o deploy em nuvem pendente
- [ ] **Submeter na plataforma** — hoje, não amanhã

---

## Dívidas conhecidas (declarar no relatório, em Próximos Passos)

Notificação por e-mail · anexar mais de uma imagem · histórico de alteração de
prioridade e responsável (hoje só o de status é auditado) · busca textual ·
exportação de relatórios · testes end-to-end · observabilidade.

Declarar limitação conhecida é sinal de maturidade técnica, não de projeto incompleto.
