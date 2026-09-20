# application — casos de uso

Orquestram o domínio. Um caso de uso = uma ação do sistema.

**Regra:** depende de `domain/` e de `ports/`. Nunca de `infrastructure/` nem de `interfaces/`.
Toda dependência chega pelo **construtor** — quem instancia é `main/container.js`.

## ports/ — contratos

Interfaces que a infraestrutura implementa: `OcorrenciaRepository`, `HistoricoRepository`,
`UsuarioRepository`, `ComentarioRepository`, `ArmazenamentoImagem`, `Hasher`, `TokenService`.

Em CommonJS, uma "interface" é uma classe com métodos que lançam `new Error('não implementado')`.
Serve de documentação e de base para os dublês de teste.

## usecases/

RegistrarUsuario · AutenticarUsuario · RegistrarOcorrencia · ListarOcorrencias ·
ObterOcorrencia · AlterarStatusOcorrencia · AlterarPrioridade · AtribuirResponsavel ·
RegistrarSolucao · AvaliarResolucao · ComentarOcorrencia · ObterIndicadores

**`AlterarStatusOcorrencia` é o caso de uso mais importante do projeto:** valida a transição
pelo domínio, altera o status e grava o `HistoricoStatus` **na mesma operação**. A trilha de
auditoria é requisito destacado do enunciado.
