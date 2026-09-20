# Coleção Postman — Resolve Aí

| Arquivo | O que é |
|---|---|
| `resolve-ai.postman_collection.json` | todos os endpoints da API, agrupados por ator |
| `resolve-ai.postman_environment.json` | environment local (`http://localhost:3000/api`) |

## Como usar

1. No Postman: **Import** → arraste os dois arquivos.
2. Selecione o environment **"Resolve Aí — local"** no canto superior direito.
3. Suba a API (`docker compose up --build`) e popule o banco (`cd api && npm run seed`).
4. Rode **Autenticação › Login (gestor)**. O script de teste grava `token` e
   `gestorId` nas variáveis da coleção — as demais requisições já herdam o Bearer.
5. Rode **Ocorrências › Registrar ocorrência (JSON)**: o `id` da nova ocorrência
   vai para a variável `ocorrenciaId`, usada por todo o resto.

Para apontar para a nuvem, troque `baseUrl` no environment.

## Roteiro sugerido — o caminho completo em 9 chamadas

Mostra o produto inteiro, incluindo a trilha de auditoria:

1. `Login (gestor)`
2. `Registrar ocorrência (JSON)` → nasce `aberta`
3. `Alterar status — transição inválida (409)` → o domínio recusa `aberta → resolvida`
4. `Alterar prioridade` → `alta`
5. `Atribuir responsável`
6. `Alterar status` → `em_analise`, depois `em_atendimento`, depois `resolvida`
   (edite o corpo a cada chamada)
7. `Registrar solução aplicada`
8. `Histórico` → quatro registros, do nascimento à resolução
9. `Login (solicitante)` → `Avaliar a resolução` → **201**; repetir responde **409**

E, por fim, `Login (gestor)` → `Dashboard de indicadores`.

## Códigos de resposta

| Código | Quando |
|---|---|
| `400` | payload inválido |
| `401` | sem token ou token inválido |
| `403` | perfil sem permissão, ou solicitante mexendo em ocorrência de outro |
| `404` | recurso inexistente |
| `409` | transição de status inválida, avaliação fora de hora ou repetida |
