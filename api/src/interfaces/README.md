# interfaces/http — adaptadores de entrada

Traduzem HTTP em chamadas de caso de uso, e o resultado de volta em resposta HTTP.

**Regra:** controller não tem regra de negócio. Nenhum `if` que decida algo do domínio.
Se apareceu um, ele pertence a uma entidade ou a um caso de uso.

- `controllers/` — recebem `req`, chamam o caso de uso, devolvem `res`
- `routes/` — um arquivo por recurso, declaram middlewares
- `middlewares/auth.js` — valida o JWT e popula `req.usuario`
- `middlewares/requirePerfil.js` — `requirePerfil('gestor')`
- `middlewares/upload.js` — multer em memória, repassa para o Cloudinary
- `middlewares/errorHandler.js` — traduz erros de domínio em status:
  `TransicaoInvalidaError` → 409 · `NaoAutorizadoError` → 403 · validação → 400
