# Resolve Aí — contexto do projeto

Hackathon final da pós FIAP Full Stack Development (6FSDT, Fase 5). **Entrega: 29/09/2026.**
Plataforma de gestão de ocorrências: solicitantes registram problemas do dia a dia
(iluminação, vazamento, limpeza, segurança, manutenção) e gestores acompanham até a
resolução, com trilha de auditoria de cada mudança de status.

**Leia antes de codar:** `docs/ESPEC-TECNICA.md` (contrato completo), `docs/DESAFIO-RESOLVE-AI.md`
(requisitos oficiais), `docs/PLANO-9-DIAS.md` (cronograma) e `docs/BACKLOG.md` (tarefas).

---

## Stack — fixa

Node 22 + Express, **CommonJS** (`require`, nunca `import`) · MongoDB Atlas + Mongoose ·
JWT + bcryptjs · React 19 + Vite + React Router + styled-components · Axios ·
Jest + Supertest · Docker · Cloudinary (upload) · Recharts (dashboard).

**Nunca introduza:** TypeScript, Next.js, Prisma, Tailwind, ORM SQL, GraphQL.
A stack espelha as Fases 2, 3 e 4 de propósito — a coerência com o curso é argumento de banca.

**Nomes em português** para campos, rotas e mensagens, como nas fases anteriores.

---

## Arquitetura — Clean Architecture

A regra de dependência aponta para dentro:

```
interfaces/http  →  application  →  domain
infrastructure   →  application  →  domain
main             →  conhece todos (só ele)
```

```
api/src/
├── domain/          entities/ errors/          — SEM libs externas
├── application/     ports/ usecases/           — depende só de domain + ports
├── infrastructure/  database/ storage/ security/ config/
├── interfaces/http/ controllers/ routes/ middlewares/
└── main/            container.js app.js server.js
```

Cada pasta tem um `README.md` explicando sua responsabilidade. **Leia o README da camada
antes de criar arquivo nela.**

### Cinco regras que não podem ser violadas

1. **Domínio puro.** Nada em `domain/` ou `application/` faz `require` de `express`,
   `mongoose`, `jsonwebtoken`, `bcryptjs` ou `cloudinary`.
2. **Injeção por construtor.** Caso de uso recebe dependências no construtor. Quem
   instancia é `main/container.js`. Nunca `require` direto de repositório dentro de caso de uso.
3. **Controller burro.** Traduz HTTP ↔ caso de uso. Nenhum `if` de regra de negócio.
4. **Auditoria atômica.** `AlterarStatusOcorrencia` valida a transição pelo domínio, altera
   o status e grava o `HistoricoStatus` **na mesma operação**. Nunca em rota separada,
   nunca no front. `RegistrarOcorrencia` grava o registro de abertura com `statusAnterior: null`.
5. **Upload sempre no Cloudinary.** O container de produção não tem disco persistente.

### Máquina de estados (em `domain/entities/Ocorrencia.js`)

```
aberta → em_analise → em_atendimento → resolvida
   └──────────┴────────────────┴──→ cancelada
```

`resolvida` e `cancelada` são finais. Transição inválida lança `TransicaoInvalidaError` → **409**.
Avaliação só com status `resolvida` e só pelo solicitante dono, senão **409**.

### Autorização

`solicitante` só enxerga e mexe nas próprias ocorrências. Só `gestor` altera status,
prioridade, responsável e solução, e só ele acessa o dashboard.

---

## Comandos

```bash
# API — primeira vez
cd api && npm init -y
npm install express mongoose jsonwebtoken bcryptjs cors dotenv multer cloudinary
npm install -D jest supertest nodemon
# scripts: start=node src/main/server.js | dev=nodemon src/main/server.js
#          test=jest --runInBand | test:cov=jest --coverage --runInBand

# Front — primeira vez
cd web && npm create vite@latest . -- --template react
npm install react-router-dom axios styled-components recharts

# Rodar tudo
cp api/.env.example api/.env && cp web/.env.example web/.env   # preencher
docker-compose up
```

Front em http://localhost:5173 · API em http://localhost:3000/api

---

## Convenções

- Um caso de uso por arquivo, nome no infinitivo: `RegistrarOcorrencia.js`
- Repositórios devolvem objetos simples, não documentos Mongoose, para não vazar a lib
- Testes de caso de uso usam repositórios falsos em memória (`tests/helpers/`) — rodam sem banco
- Testes de HTTP usam Supertest
- Commits em português, no imperativo: `feat: registra historico ao alterar status`

## Definição de pronto

Uma tarefa só está pronta quando: o caso de uso tem teste · o endpoint responde os códigos
certos (400/401/403/404/409) · a camada certa recebeu o código · e `docker-compose up` sobe sem erro.
