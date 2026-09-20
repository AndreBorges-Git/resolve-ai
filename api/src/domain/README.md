# domain — o núcleo

Entidades e regras de negócio puras.

**Regra absoluta:** nenhum arquivo aqui faz `require` de `express`, `mongoose`,
`jsonwebtoken`, `bcryptjs`, `cloudinary` ou qualquer lib externa. Só JavaScript.

## O que mora aqui

- `entities/Ocorrencia.js` — máquina de estados (transições válidas), regra de quem
  pode avaliar e quando, regra de quem pode alterar o quê.
- `entities/Usuario.js` — regras de perfil (`solicitante` / `gestor`).
- `errors/` — `DomainError`, `TransicaoInvalidaError`, `NaoAutorizadoError`.
  O `errorHandler` da camada HTTP traduz cada um em um status code.

Se você precisou importar algo de fora para escrever uma regra, a regra não pertence a esta camada.
