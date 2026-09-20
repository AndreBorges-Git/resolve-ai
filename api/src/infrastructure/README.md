# infrastructure — os detalhes substituíveis

Implementa as portas de `application/ports/`. É aqui, e só aqui, que vivem Mongoose,
bcrypt, JWT e Cloudinary.

- `database/mongoose/schemas/` — schemas Mongoose (Usuario, Ocorrencia, HistoricoStatus, Comentario)
- `database/mongoose/repositories/` — implementam as portas de repositório
- `security/BcryptHasher.js` — implementa `Hasher`
- `security/JwtTokenService.js` — implementa `TokenService`
- `storage/CloudinaryArmazenamentoImagem.js` — implementa `ArmazenamentoImagem`
- `config/db.js` — conexão

**Por que Cloudinary e não disco:** o container em produção não tem disco persistente.
Imagem gravada em disco desaparece no próximo deploy.
