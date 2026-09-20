# Resolve Aí — Plataforma de Gestão de Ocorrências

Hackathon — Pós-graduação FIAP Full Stack Development (6FSDT, Fase 5).

> ⚠️ Preencher antes da entrega: URLs de produção, instruções de execução e credenciais de demonstração.

## Links

- **Aplicação (front):** _a preencher — Vercel_
- **API:** _a preencher — Render_
- **Repositório:** _a preencher_

> A API roda no plano gratuito do Render e hiberna após 15 minutos sem acesso.
> A primeira requisição pode levar cerca de 1 minuto para responder.

## O problema

Condomínios, empresas e bairros recebem solicitações por mensagem, e-mail e conversa
informal. Sem registro estruturado não há priorização, não há responsável definido e
não há como auditar o que foi feito. O Resolve Aí dá a essas ocorrências um ciclo de
vida rastreável do registro à avaliação da resolução.

## Perfis

- **Solicitante** — registra ocorrências com foto e localização, acompanha o andamento, comenta e avalia a resolução.
- **Gestor** — vê todas as ocorrências, filtra, prioriza, atribui responsável, move o status, registra a solução e acompanha indicadores.

## Ciclo de vida

`aberta → em análise → em atendimento → resolvida`, com `cancelada` a partir de
qualquer estado não final. **Toda transição gera um registro de auditoria** com status
anterior, novo status, data e hora, usuário responsável e observação.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js 22 + Express |
| Banco | MongoDB Atlas + Mongoose |
| Autenticação | JWT + bcryptjs |
| Frontend | React 19 + Vite + React Router + styled-components |
| Imagens | Cloudinary |
| Testes | Jest + Supertest |
| Container | Docker + Docker Compose |
| CI | GitHub Actions |
| Deploy | Render (API) + Vercel (front) |

## Arquitetura

API em camadas — **Routes → Controllers → Models**. Diagrama em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

## Como rodar

```bash
cp api/.env.example api/.env    # preencher
cp web/.env.example web/.env
docker-compose up
```

Front em http://localhost:5173 · API em http://localhost:3000/api

## Testes

```bash
cd api && npm test
```

## Documentação da API

Coleção Postman em [`docs/postman/`](docs/postman/).
