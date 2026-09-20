# Resolve Aí — contexto para o agente de código

Hackathon final da pós-graduação FIAP Full Stack Development (6FSDT, Fase 5).
Plataforma de gestão de ocorrências: usuários registram problemas do dia a dia
(iluminação, vazamento, limpeza, segurança, manutenção) e acompanham até a resolução.

A especificação completa está em `../ESPEC-TECNICA.md` e os requisitos oficiais em
`../DESAFIO-RESOLVE-AI.md`. **Leia os dois antes de escrever código.**

## Stack — fixa, não negociável

Node 22 + Express (CommonJS, `require`) · MongoDB Atlas + Mongoose · JWT + bcryptjs ·
React 19 + Vite + React Router + styled-components · Axios · Jest + Supertest ·
Docker + docker-compose · GitHub Actions.

Adições obrigadas pelo enunciado: Cloudinary (upload), Render + Vercel (deploy), Recharts (dashboard).

**Nunca introduza:** TypeScript, Next.js, Prisma, Tailwind, ORM SQL, n8n.
A stack espelha as fases 2, 3 e 4 do curso de propósito — a coerência com o que foi
visto na pós é argumento de defesa na banca.

## Arquitetura

API em camadas, igual à Fase 2: **Routes → Controllers → Models**.
Nada de lógica de negócio em rota. Nada de acesso ao Mongoose em controller de outra entidade.

```
api/src/
  config/db.js          conexão Mongoose
  models/               Usuario, Ocorrencia, HistoricoStatus, Comentario
  middleware/           auth.js, requirePerfil.js, upload.js, errorHandler.js
  controllers/          authController, ocorrenciaController, comentarioController,
                        dashboardController, usuarioController
  routes/               um arquivo por recurso
  app.js  server.js
web/src/
  context/AuthContext.jsx
  components/           Navbar, PrivateRoute, StatusBadge, Timeline, EmptyState
  pages/                Login, Registro, MinhasOcorrencias, NovaOcorrencia,
                        DetalheOcorrencia, PainelGestor, Dashboard
  services/             uma função por endpoint (padrão da Fase 3/4)
```

## Regras inegociáveis

1. **Trilha de auditoria.** Toda mudança de status grava um `HistoricoStatus` com status
   anterior, status novo, data, usuário e observação — **dentro do mesmo controller que
   muda o status**, na mesma operação. Nunca em rota separada, nunca no front.
   Na criação da ocorrência, gravar o registro de abertura com `statusAnterior: null`.
2. **Máquina de estados.** aberta → em_analise → em_atendimento → resolvida; cancelada a
   partir de qualquer estado não final. Transição inválida devolve **409**.
3. **Autorização por perfil.** `solicitante` só enxerga e mexe nas próprias ocorrências.
   Só `gestor` altera status, prioridade, responsável e solução, e só ele vê o dashboard.
4. **Upload sempre no Cloudinary.** O host de produção não tem disco persistente —
   `multer` gravando em disco perde a imagem no deploy seguinte.
5. **Avaliação só com status `resolvida`**, e só pelo solicitante dono. Senão, 409.
6. **Português** em nomes de campo, rotas e mensagens, como nas fases anteriores.

## Instalação das dependências

```bash
cd api && npm init -y
npm install express mongoose jsonwebtoken bcryptjs cors dotenv multer cloudinary multer-storage-cloudinary
npm install -D jest supertest nodemon

cd ../web && npm create vite@latest . -- --template react
npm install react-router-dom axios styled-components recharts
```

Depois ajuste os `scripts` do `api/package.json` para:
`start` = `node src/server.js` · `dev` = `nodemon src/server.js` · `test` = `jest --coverage --runInBand`

## Ordem de implementação

Siga `../PLANO-9-DIAS.md`. Resumo: infra e deploy primeiro (D1), depois auth (D2),
ocorrências e upload (D3), status e auditoria (D4), resto da API (D5), front (D6–D7).
