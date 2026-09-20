# main — composição

- `container.js` — instancia repositórios, serviços e casos de uso, e liga tudo.
  É o único lugar do projeto que conhece todas as camadas ao mesmo tempo.
- `app.js` — monta o Express: cors, json, rotas, errorHandler.
- `server.js` — conecta no banco e sobe o servidor.

Trocar Mongo por Postgres, ou Cloudinary por S3, deve significar mexer só em
`infrastructure/` e em uma linha do `container.js`. Se exigir mexer em mais lugares,
alguma camada está vazando.
