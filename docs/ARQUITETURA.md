# Arquitetura

> Preencher os detalhes conforme a implementação avançar.

## Visão geral

```mermaid
flowchart LR
    U["Navegador<br/>React + Vite"] -->|HTTPS / Axios| A["API Express<br/>Render"]
    A -->|Mongoose| M[("MongoDB Atlas")]
    A -->|upload| C["Cloudinary"]
    U -->|imagens| C
```

## Camadas da API

```mermaid
flowchart TD
    R["Routes<br/>define endpoints e middlewares"] --> C["Controllers<br/>regra de negócio"]
    C --> MO["Models<br/>schemas Mongoose"]
    MO --> DB[("MongoDB")]
    R -.->|auth / requirePerfil| MW["Middleware"]
```

## Ciclo de vida da ocorrência

```mermaid
stateDiagram-v2
    [*] --> aberta
    aberta --> em_analise
    em_analise --> em_atendimento
    em_atendimento --> resolvida
    aberta --> cancelada
    em_analise --> cancelada
    em_atendimento --> cancelada
    resolvida --> [*]
    cancelada --> [*]
```

Cada transição grava um documento em `HistoricoStatus` contendo status anterior,
status novo, data e hora, usuário responsável e observação.

## Modelo de dados

```mermaid
erDiagram
    USUARIO ||--o{ OCORRENCIA : registra
    USUARIO ||--o{ COMENTARIO : escreve
    USUARIO ||--o{ HISTORICO_STATUS : altera
    OCORRENCIA ||--o{ COMENTARIO : recebe
    OCORRENCIA ||--o{ HISTORICO_STATUS : gera
```
